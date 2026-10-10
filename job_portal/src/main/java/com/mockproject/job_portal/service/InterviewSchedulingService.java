package com.mockproject.job_portal.service;

import com.mockproject.job_portal.dto.request.ScheduleInterviewRequest;
import com.mockproject.job_portal.dto.response.InterviewSlotResponse;
import com.mockproject.job_portal.entity.InterviewSlot;
import com.mockproject.job_portal.entity.JobApplication;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.entity.enums.ApplicationStatus;
import com.mockproject.job_portal.entity.enums.Role;
import com.mockproject.job_portal.exception.BadRequestException;
import com.mockproject.job_portal.exception.ResourceNotFoundException;
import com.mockproject.job_portal.repository.InterviewSlotRepository;
import com.mockproject.job_portal.repository.JobApplicationRepository;
import com.mockproject.job_portal.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InterviewSchedulingService {

    private final JobApplicationRepository applicationRepository;
    private final InterviewSlotRepository interviewSlotRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public InterviewSchedulingService(JobApplicationRepository applicationRepository,
                                      InterviewSlotRepository interviewSlotRepository,
                                      UserRepository userRepository,
                                      NotificationService notificationService) {
        this.applicationRepository = applicationRepository;
        this.interviewSlotRepository = interviewSlotRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // Schedules an interview for a shortlisted application and updates its status.
    @Transactional
    public InterviewSlotResponse schedule(ScheduleInterviewRequest request) {
        JobApplication application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Job application", "id", request.getApplicationId()));
        findRecruiter(request.getRecruiterId());
        if (application.getStatus() != ApplicationStatus.SHORTLISTED) {
            throw new BadRequestException("Only shortlisted applications can be scheduled for interview");
        }
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new BadRequestException("Interview end time must be after start time");
        }
        InterviewSlot slot = InterviewSlot.builder()
                .application(application)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .meetingLink(request.getMeetingLink())
                .location(request.getLocation())
                .build();
        application.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        applicationRepository.save(application);
        InterviewSlot savedSlot = interviewSlotRepository.save(slot);
        notificationService.create(application.getCandidate().getId(),
            "Interview scheduled",
            "An interview has been scheduled for your application at " + savedSlot.getStartTime() + ".");
        return InterviewSlotResponse.from(savedSlot);
    }

    // Finds a user and verifies that the account is a recruiter.
    private User findRecruiter(Long recruiterId) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", recruiterId));
        if (recruiter.getRole() != Role.RECRUITER) {
            throw new BadRequestException("Only recruiters can schedule interviews");
        }
        return recruiter;
    }
}
