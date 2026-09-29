package com.mockproject.job_portal.service;

import com.mockproject.job_portal.dto.request.InterviewFeedbackRequest;
import com.mockproject.job_portal.dto.response.InterviewFeedbackResponse;
import com.mockproject.job_portal.entity.InterviewFeedback;
import com.mockproject.job_portal.entity.InterviewSlot;
import com.mockproject.job_portal.entity.JobApplication;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.entity.enums.ApplicationStatus;
import com.mockproject.job_portal.entity.enums.FeedbackResult;
import com.mockproject.job_portal.entity.enums.InterviewStatus;
import com.mockproject.job_portal.exception.BadRequestException;
import com.mockproject.job_portal.exception.ResourceNotFoundException;
import com.mockproject.job_portal.repository.InterviewFeedbackRepository;
import com.mockproject.job_portal.repository.InterviewSlotRepository;
import com.mockproject.job_portal.repository.JobApplicationRepository;
import com.mockproject.job_portal.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class InterviewFeedbackService {

    private final InterviewSlotRepository interviewSlotRepository;
    private final InterviewFeedbackRepository feedbackRepository;
    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobApplicationService applicationService;
    private final NotificationService notificationService;

    public InterviewFeedbackService(InterviewSlotRepository interviewSlotRepository,
                                    InterviewFeedbackRepository feedbackRepository,
                                    JobApplicationRepository applicationRepository,
                                    UserRepository userRepository,
                                    JobApplicationService applicationService,
                                    NotificationService notificationService) {
        this.interviewSlotRepository = interviewSlotRepository;
        this.feedbackRepository = feedbackRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.applicationService = applicationService;
        this.notificationService = notificationService;
    }

    // Step 3: after the interview, PASS -> INTERVIEW_PASSED, FAIL -> REJECTED. The slot becomes COMPLETED.
    @Transactional
    public InterviewFeedbackResponse addFeedback(Long slotId, Long recruiterId, InterviewFeedbackRequest request) {
        InterviewSlot slot = interviewSlotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Lịch phỏng vấn", "id", slotId));
        JobApplication application = applicationService.getApplicationOfRecruiter(slot.getApplication().getId(), recruiterId);

        if (slot.getStatus() != InterviewStatus.SCHEDULED || feedbackRepository.existsByInterviewSlotId(slotId)) {
            throw new BadRequestException("Buổi phỏng vấn này đã được đánh giá hoặc đã hủy");
        }
        if (LocalDateTime.now().isBefore(slot.getStartTime())) {
            throw new BadRequestException("Chỉ có thể đánh giá sau khi buổi phỏng vấn bắt đầu");
        }
        User interviewer = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", recruiterId));

        InterviewFeedback feedback = feedbackRepository.save(InterviewFeedback.builder()
                .interviewSlot(slot)
                .interviewer(interviewer)
                .score(request.getScore())
                .comments(request.getComments())
                .result(request.getResult())
                .build());
        slot.setStatus(InterviewStatus.COMPLETED);
        interviewSlotRepository.save(slot);

        String jobTitle = application.getJobListing().getTitle();
        if (request.getResult() == FeedbackResult.PASS) {
            application.setStatus(ApplicationStatus.INTERVIEW_PASSED);
            notificationService.create(application.getCandidate().getId(),
                    "Bạn đã đạt vòng phỏng vấn",
                    "Chúc mừng! Bạn đã vượt qua vòng phỏng vấn vị trí \"" + jobTitle + "\".");
        } else {
            application.setStatus(ApplicationStatus.REJECTED);
            application.setRejectionReason("Kết quả phỏng vấn chưa đạt");
            notificationService.create(application.getCandidate().getId(),
                    "Kết quả phỏng vấn",
                    "Rất tiếc, bạn chưa vượt qua vòng phỏng vấn vị trí \"" + jobTitle + "\".");
        }
        applicationRepository.save(application);
        return InterviewFeedbackResponse.from(feedback);
    }
}
