package com.mockproject.job_portal.repository;

import com.mockproject.job_portal.entity.InterviewFeedback;
import com.mockproject.job_portal.entity.enums.FeedbackResult;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InterviewFeedbackRepository extends JpaRepository<InterviewFeedback, Long> {

    // Prevents multiple feedback records for the same interview slot.
    boolean existsByInterviewSlotId(Long interviewSlotId);

    // Checks whether an application has at least one passing interview feedback.
    boolean existsByInterviewSlotApplicationIdAndResult(Long applicationId, FeedbackResult result);
}
