package com.mockproject.job_portal.service;

import com.mockproject.job_portal.dto.request.ApplyJobRequest;
import com.mockproject.job_portal.dto.response.InterviewSlotResponse;
import com.mockproject.job_portal.dto.response.JobApplicationResponse;
import com.mockproject.job_portal.dto.response.OfferResponse;
import com.mockproject.job_portal.entity.CandidateProfile;
import com.mockproject.job_portal.entity.InterviewSlot;
import com.mockproject.job_portal.entity.JobApplication;
import com.mockproject.job_portal.entity.JobListing;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.entity.enums.ApplicationStatus;
import com.mockproject.job_portal.entity.enums.InterviewStatus;
import com.mockproject.job_portal.entity.enums.JobStatus;
import com.mockproject.job_portal.exception.AppException;
import com.mockproject.job_portal.exception.BadRequestException;
import com.mockproject.job_portal.exception.ResourceNotFoundException;
import com.mockproject.job_portal.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class JobApplicationService {

    // Statuses in which the recruiter can still reject an application (before an offer is sent).
    private static final Set<ApplicationStatus> REJECTABLE = Set.of(
            ApplicationStatus.APPLIED, ApplicationStatus.SHORTLISTED,
            ApplicationStatus.INTERVIEW_SCHEDULED, ApplicationStatus.INTERVIEW_PASSED);

    private final JobApplicationRepository applicationRepository;
    private final JobListingRepository jobListingRepository;
    private final UserRepository userRepository;
    private final CandidateProfileRepository profileRepository;
    private final InterviewSlotRepository interviewSlotRepository;
    private final OfferRepository offerRepository;
    private final NotificationService notificationService;

    public JobApplicationService(JobApplicationRepository applicationRepository,
                                 JobListingRepository jobListingRepository,
                                 UserRepository userRepository,
                                 CandidateProfileRepository profileRepository,
                                 InterviewSlotRepository interviewSlotRepository,
                                 OfferRepository offerRepository,
                                 NotificationService notificationService) {
        this.applicationRepository = applicationRepository;
        this.jobListingRepository = jobListingRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.interviewSlotRepository = interviewSlotRepository;
        this.offerRepository = offerRepository;
        this.notificationService = notificationService;
    }

    // Submits an application to an OPEN job; uses the profile's default CV when no CV is uploaded.
    @Transactional
    public JobApplicationResponse apply(Long jobId, Long candidateId, ApplyJobRequest request) {
        JobListing job = jobListingRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Tin tuyển dụng", "id", jobId));
        if (job.getStatus() != JobStatus.OPEN) {
            throw new BadRequestException("Tin tuyển dụng đã đóng, không thể nộp hồ sơ");
        }
        if (applicationRepository.existsByJobListingIdAndCandidateId(jobId, candidateId)) {
            throw new BadRequestException("Bạn đã ứng tuyển vị trí này rồi");
        }
        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", candidateId));

        String resumeUrl = request.getResumeUrl();
        if (resumeUrl == null || resumeUrl.isBlank()) {
            resumeUrl = profileRepository.findByUserId(candidateId)
                    .map(CandidateProfile::getResumeUrl)
                    .orElse(null);
        }
        if (resumeUrl == null || !resumeUrl.startsWith("/api/v1/files/resumes/")) {
            throw new BadRequestException("Vui lòng tải lên CV hoặc cài đặt CV mặc định trong hồ sơ");
        }

        JobApplication application = JobApplication.builder()
                .jobListing(job)
                .candidate(candidate)
                .resumeUrl(resumeUrl)
                .coverLetter(request.getCoverLetter())
                .build();
        JobApplication saved = applicationRepository.save(application);

        notificationService.create(job.getCompany().getRecruiter().getId(),
                "Có hồ sơ ứng tuyển mới",
                candidate.getFullName() + " vừa ứng tuyển vị trí \"" + job.getTitle() + "\".");
        return toResponse(saved);
    }

    // Returns all applications of the logged-in job seeker.
    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getMyApplications(Long candidateId) {
        return applicationRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Returns the applications to all jobs of the recruiter, or to one job when jobId is given.
    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getRecruiterApplications(Long recruiterId, Long jobId) {
        List<JobApplication> applications;
        if (jobId != null) {
            JobListing job = jobListingRepository.findById(jobId)
                    .orElseThrow(() -> new ResourceNotFoundException("Tin tuyển dụng", "id", jobId));
            if (!job.getCompany().getRecruiter().getId().equals(recruiterId)) {
                throw new AppException("Bạn chỉ xem được hồ sơ của tin tuyển dụng của mình", HttpStatus.FORBIDDEN);
            }
            applications = applicationRepository.findByJobListingIdOrderByCreatedAtDesc(jobId);
        } else {
            applications = applicationRepository.findByJobListingCompanyRecruiterIdOrderByCreatedAtDesc(recruiterId);
        }
        return applications.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // The candidate can withdraw (delete) an application only before the recruiter processes it.
    @Transactional
    public void withdraw(Long applicationId, Long candidateId) {
        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn ứng tuyển", "id", applicationId));
        if (!application.getCandidate().getId().equals(candidateId)) {
            throw new AppException("Bạn chỉ có thể rút đơn của mình", HttpStatus.FORBIDDEN);
        }
        if (application.getStatus() != ApplicationStatus.APPLIED) {
            throw new BadRequestException("Chỉ có thể rút đơn khi nhà tuyển dụng chưa xử lý");
        }
        applicationRepository.delete(application);
    }

    // The recruiter rejects an application at any step before the offer.
    @Transactional
    public JobApplicationResponse reject(Long applicationId, Long recruiterId, String reason) {
        JobApplication application = getApplicationOfRecruiter(applicationId, recruiterId);
        if (!REJECTABLE.contains(application.getStatus())) {
            throw new BadRequestException("Không thể từ chối hồ sơ ở trạng thái hiện tại");
        }
        // A scheduled interview that will not happen anymore is cancelled.
        for (InterviewSlot slot : interviewSlotRepository.findByApplicationIdAndStatus(applicationId, InterviewStatus.SCHEDULED)) {
            slot.setStatus(InterviewStatus.CANCELLED);
            interviewSlotRepository.save(slot);
        }
        application.setStatus(ApplicationStatus.REJECTED);
        application.setRejectionReason(reason);
        applicationRepository.save(application);

        notificationService.create(application.getCandidate().getId(),
                "Kết quả ứng tuyển",
                "Rất tiếc, hồ sơ của bạn cho vị trí \"" + application.getJobListing().getTitle() + "\" chưa phù hợp.");
        return toResponse(application);
    }

    // Loads an application and checks that it belongs to one of the recruiter's jobs.
    // Shared by the shortlist, interview and offer services.
    public JobApplication getApplicationOfRecruiter(Long applicationId, Long recruiterId) {
        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn ứng tuyển", "id", applicationId));
        if (!application.getJobListing().getCompany().getRecruiter().getId().equals(recruiterId)) {
            throw new AppException("Bạn chỉ có thể xử lý hồ sơ của tin tuyển dụng của mình", HttpStatus.FORBIDDEN);
        }
        return application;
    }

    // Adds the latest interview slot and the offer (if any) to the response.
    private JobApplicationResponse toResponse(JobApplication application) {
        InterviewSlotResponse interview = interviewSlotRepository
                .findByApplicationIdOrderByStartTimeDesc(application.getId())
                .stream()
                .findFirst()
                .map(InterviewSlotResponse::from)
                .orElse(null);
        OfferResponse offer = offerRepository.findByApplicationId(application.getId())
                .map(OfferResponse::from)
                .orElse(null);
        return JobApplicationResponse.from(application, interview, offer);
    }
}
