package com.mockproject.job_portal.service;

import com.mockproject.job_portal.dto.request.ScheduleInterviewRequest;
import com.mockproject.job_portal.dto.response.InterviewSlotResponse;
import com.mockproject.job_portal.entity.InterviewSlot;
import com.mockproject.job_portal.entity.JobApplication;
import com.mockproject.job_portal.entity.enums.ApplicationStatus;
import com.mockproject.job_portal.exception.BadRequestException;
import com.mockproject.job_portal.repository.InterviewSlotRepository;
import com.mockproject.job_portal.repository.JobApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class InterviewSchedulingService {

    private static final DateTimeFormatter FORMAT = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");

    private final JobApplicationRepository applicationRepository;
    private final InterviewSlotRepository interviewSlotRepository;
    private final JobApplicationService applicationService;
    private final NotificationService notificationService;

    public InterviewSchedulingService(JobApplicationRepository applicationRepository,
                                      InterviewSlotRepository interviewSlotRepository,
                                      JobApplicationService applicationService,
                                      NotificationService notificationService) {
        this.applicationRepository = applicationRepository;
        this.interviewSlotRepository = interviewSlotRepository;
        this.applicationService = applicationService;
        this.notificationService = notificationService;
    }

    // Step 2: SHORTLISTED -> INTERVIEW_SCHEDULED.
    @Transactional
    public InterviewSlotResponse schedule(Long recruiterId, ScheduleInterviewRequest request) {
        JobApplication application = applicationService.getApplicationOfRecruiter(request.getApplicationId(), recruiterId);
        if (application.getStatus() != ApplicationStatus.SHORTLISTED) {
            throw new BadRequestException("Chỉ có thể hẹn phỏng vấn với hồ sơ đã được shortlist");
        }
        if (!request.getStartTime().isAfter(LocalDateTime.now())) {
            throw new BadRequestException("Thời gian phỏng vấn phải ở tương lai");
        }
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new BadRequestException("Giờ kết thúc phải sau giờ bắt đầu");
        }
        boolean noLink = request.getMeetingLink() == null || request.getMeetingLink().isBlank();
        boolean noLocation = request.getLocation() == null || request.getLocation().isBlank();
        if (noLink && noLocation) {
            throw new BadRequestException("Vui lòng nhập link họp online hoặc địa điểm phỏng vấn");
        }

        InterviewSlot slot = interviewSlotRepository.save(InterviewSlot.builder()
                .application(application)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .meetingLink(request.getMeetingLink())
                .location(request.getLocation())
                .build());
        application.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        applicationRepository.save(application);

        notificationService.create(application.getCandidate().getId(),
                "Lịch phỏng vấn mới",
                "Bạn có lịch phỏng vấn vị trí \"" + application.getJobListing().getTitle()
                        + "\" lúc " + slot.getStartTime().format(FORMAT) + ".");
        return InterviewSlotResponse.from(slot);
    }
}
