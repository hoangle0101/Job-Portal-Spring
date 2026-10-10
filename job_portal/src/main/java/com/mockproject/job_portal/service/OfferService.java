package com.mockproject.job_portal.service;

import com.mockproject.job_portal.dto.request.CreateOfferRequest;
import com.mockproject.job_portal.dto.request.OfferResponseRequest;
import com.mockproject.job_portal.dto.response.OfferResponse;
import com.mockproject.job_portal.entity.JobApplication;
import com.mockproject.job_portal.entity.Offer;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.entity.enums.ApplicationStatus;
import com.mockproject.job_portal.entity.enums.FeedbackResult;
import com.mockproject.job_portal.entity.enums.OfferStatus;
import com.mockproject.job_portal.entity.enums.Role;
import com.mockproject.job_portal.exception.BadRequestException;
import com.mockproject.job_portal.exception.ResourceNotFoundException;
import com.mockproject.job_portal.repository.InterviewFeedbackRepository;
import com.mockproject.job_portal.repository.JobApplicationRepository;
import com.mockproject.job_portal.repository.OfferRepository;
import com.mockproject.job_portal.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class OfferService {

    private final JobApplicationRepository applicationRepository;
    private final OfferRepository offerRepository;
    private final InterviewFeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public OfferService(JobApplicationRepository applicationRepository,
                        OfferRepository offerRepository,
                        InterviewFeedbackRepository feedbackRepository,
                        UserRepository userRepository,
                        NotificationService notificationService) {
        this.applicationRepository = applicationRepository;
        this.offerRepository = offerRepository;
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // Creates an offer only after a passing interview feedback is recorded.
    @Transactional
    public OfferResponse createOffer(Long applicationId, CreateOfferRequest request) {
        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application", "id", applicationId));
        findRecruiter(request.getRecruiterId());
        if (application.getStatus() != ApplicationStatus.INTERVIEW_SCHEDULED) {
            throw new BadRequestException("Only interviewed applications can receive an offer");
        }
        if (!feedbackRepository.existsByInterviewSlotApplicationIdAndResult(applicationId, FeedbackResult.PASS)) {
            throw new BadRequestException("A passing interview feedback is required before sending an offer");
        }
        if (offerRepository.existsByApplicationId(applicationId)) {
            throw new BadRequestException("An offer already exists for this application");
        }
        if (request.getStartDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Offer start date cannot be in the past");
        }
        Offer offer = Offer.builder()
                .application(application)
                .salary(request.getSalary())
                .startDate(request.getStartDate())
                .notes(request.getNotes())
                .build();
        application.setStatus(ApplicationStatus.OFFERED);
        applicationRepository.save(application);
        Offer savedOffer = offerRepository.save(offer);
        notificationService.create(application.getCandidate().getId(),
            "New job offer",
            "You have received a new job offer.");
        return OfferResponse.from(savedOffer);
    }

    // Finds a user and verifies that the account is a recruiter.
    private User findRecruiter(Long recruiterId) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", recruiterId));
        if (recruiter.getRole() != Role.RECRUITER) {
            throw new BadRequestException("Only recruiters can send offers");
        }
        return recruiter;
    }

    // Records the candidate's acceptance or rejection of a pending offer.
    @Transactional
    public OfferResponse respond(Long offerId, OfferResponseRequest request) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer", "id", offerId));
        if (request.getStatus() == OfferStatus.PENDING) {
            throw new BadRequestException("Offer response must be ACCEPTED or DECLINED");
        }
        if (!offer.getStatus().equals(OfferStatus.PENDING)) {
            throw new BadRequestException("This offer has already been answered");
        }
        if (!offer.getApplication().getCandidate().getId().equals(request.getCandidateId())) {
            throw new BadRequestException("Only the candidate can respond to this offer");
        }
        offer.setStatus(request.getStatus());
        return OfferResponse.from(offerRepository.save(offer));
    }
}
