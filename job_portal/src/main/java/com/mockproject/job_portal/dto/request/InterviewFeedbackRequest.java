package com.mockproject.job_portal.dto.request;

import com.mockproject.job_portal.entity.enums.FeedbackResult;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InterviewFeedbackRequest {

    @NotNull
    private Long interviewerId;

    @NotNull
    @Min(0)
    @Max(100)
    private Integer score;

    private String comments;

    @NotNull
    private FeedbackResult result;
}
