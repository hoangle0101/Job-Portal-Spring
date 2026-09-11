package com.mockproject.job_portal.service;

import com.mockproject.job_portal.dto.request.CreateOfferRequest;
import com.mockproject.job_portal.dto.response.OfferResponse;
import com.mockproject.job_portal.entity.JobApplication;
import com.mockproject.job_portal.entity.Offer;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.entity.enums.ApplicationStatus;
import com.mockproject.job_portal.entity.enums.FeedbackResult;
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

    public OfferService(JobApplicationRepository applicationRepository,
                        OfferRepository offerRepository,
                        InterviewFeedbackRepository feedbackRepository,
                        UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.offerRepository = offerRepository;
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
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
        return OfferResponse.from(offerRepository.save(offer));
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
}
