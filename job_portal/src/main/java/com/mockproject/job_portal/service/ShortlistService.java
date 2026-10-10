package com.mockproject.job_portal.service;

import com.mockproject.job_portal.dto.request.ShortlistRequest;
import com.mockproject.job_portal.dto.response.ShortlistResponse;
import com.mockproject.job_portal.entity.JobApplication;
import com.mockproject.job_portal.entity.Shortlist;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.entity.enums.ApplicationStatus;
import com.mockproject.job_portal.entity.enums.Role;
import com.mockproject.job_portal.exception.BadRequestException;
import com.mockproject.job_portal.exception.ResourceNotFoundException;
import com.mockproject.job_portal.repository.JobApplicationRepository;
import com.mockproject.job_portal.repository.ShortlistRepository;
import com.mockproject.job_portal.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ShortlistService {

    private final JobApplicationRepository applicationRepository;
    private final ShortlistRepository shortlistRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ShortlistService(JobApplicationRepository applicationRepository,
                            ShortlistRepository shortlistRepository,
                            UserRepository userRepository,
                            NotificationService notificationService) {
        this.applicationRepository = applicationRepository;
        this.shortlistRepository = shortlistRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // Shortlists an application and advances it to the SHORTLISTED status.
    @Transactional
    public ShortlistResponse shortlist(Long applicationId, ShortlistRequest request) {
        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application", "id", applicationId));
        User recruiter = findRecruiter(request.getRecruiterId());
        if (shortlistRepository.existsByApplicationId(applicationId)) {
            throw new BadRequestException("Application is already shortlisted");
        }
        if (application.getStatus() != ApplicationStatus.APPLIED) {
            throw new BadRequestException("Only applied applications can be shortlisted");
        }
        application.setStatus(ApplicationStatus.SHORTLISTED);
        applicationRepository.save(application);
        Shortlist shortlist = Shortlist.builder()
                .application(application)
                .recruiter(recruiter)
                .note(request.getNote())
                .build();
        Shortlist savedShortlist = shortlistRepository.save(shortlist);
        notificationService.create(application.getCandidate().getId(),
            "Application shortlisted",
            "Your application has been shortlisted by the recruiter.");
        return ShortlistResponse.from(savedShortlist);
    }

    // Finds a user and verifies that the account is a recruiter.
    private User findRecruiter(Long recruiterId) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", recruiterId));
        if (recruiter.getRole() != Role.RECRUITER) {
            throw new BadRequestException("Only recruiters can shortlist applications");
        }
        return recruiter;
    }
}
