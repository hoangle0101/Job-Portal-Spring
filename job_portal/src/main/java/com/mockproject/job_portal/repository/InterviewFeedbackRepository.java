package com.mockproject.job_portal.repository;

import com.mockproject.job_portal.entity.InterviewFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InterviewFeedbackRepository extends JpaRepository<InterviewFeedback, Long> {

    // Prevents multiple feedback records for the same interview slot.
    boolean existsByInterviewSlotId(Long interviewSlotId);
}
