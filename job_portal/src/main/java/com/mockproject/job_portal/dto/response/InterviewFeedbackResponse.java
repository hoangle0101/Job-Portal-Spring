package com.mockproject.job_portal.dto.response;

import com.mockproject.job_portal.entity.InterviewFeedback;
import com.mockproject.job_portal.entity.enums.FeedbackResult;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class InterviewFeedbackResponse {

    private Long id;
    private Long interviewSlotId;
    private Long interviewerId;
    private Integer score;
    private String comments;
    private FeedbackResult result;

    // Converts feedback without exposing complete related entities.
    public static InterviewFeedbackResponse from(InterviewFeedback feedback) {
        return InterviewFeedbackResponse.builder()
                .id(feedback.getId())
                .interviewSlotId(feedback.getInterviewSlot().getId())
                .interviewerId(feedback.getInterviewer().getId())
                .score(feedback.getScore())
                .comments(feedback.getComments())
                .result(feedback.getResult())
                .build();
    }
}
