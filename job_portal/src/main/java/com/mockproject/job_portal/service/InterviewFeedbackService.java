package com.mockproject.job_portal.service;

import com.mockproject.job_portal.dto.request.InterviewFeedbackRequest;
import com.mockproject.job_portal.dto.response.InterviewFeedbackResponse;
import com.mockproject.job_portal.entity.InterviewFeedback;
import com.mockproject.job_portal.entity.InterviewSlot;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.entity.enums.InterviewStatus;
import com.mockproject.job_portal.entity.enums.Role;
import com.mockproject.job_portal.exception.BadRequestException;
import com.mockproject.job_portal.exception.ResourceNotFoundException;
import com.mockproject.job_portal.repository.InterviewFeedbackRepository;
import com.mockproject.job_portal.repository.InterviewSlotRepository;
import com.mockproject.job_portal.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InterviewFeedbackService {

    private final InterviewSlotRepository interviewSlotRepository;
    private final InterviewFeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    public InterviewFeedbackService(InterviewSlotRepository interviewSlotRepository,
                                    InterviewFeedbackRepository feedbackRepository,
                                    UserRepository userRepository) {
        this.interviewSlotRepository = interviewSlotRepository;
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
    }

    // Saves recruiter feedback and marks the interview slot as completed.
    @Transactional
    public InterviewFeedbackResponse addFeedback(Long slotId, InterviewFeedbackRequest request) {
        InterviewSlot slot = interviewSlotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview slot", "id", slotId));
        User interviewer = findInterviewer(request.getInterviewerId());
        if (slot.getStatus() != InterviewStatus.SCHEDULED) {
            throw new BadRequestException("Only scheduled interviews can receive feedback");
        }
        if (feedbackRepository.existsByInterviewSlotId(slotId)) {
            throw new BadRequestException("Feedback already exists for this interview");
        }
        InterviewFeedback feedback = InterviewFeedback.builder()
                .interviewSlot(slot)
                .interviewer(interviewer)
                .score(request.getScore())
                .comments(request.getComments())
                .result(request.getResult())
                .build();
        slot.setStatus(InterviewStatus.COMPLETED);
        interviewSlotRepository.save(slot);
        return InterviewFeedbackResponse.from(feedbackRepository.save(feedback));
    }

    // Finds a user and verifies that the account can provide recruiter feedback.
    private User findInterviewer(Long interviewerId) {
        User interviewer = userRepository.findById(interviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", interviewerId));
        if (interviewer.getRole() != Role.RECRUITER) {
            throw new BadRequestException("Only recruiters can provide interview feedback");
        }
        return interviewer;
    }
}
