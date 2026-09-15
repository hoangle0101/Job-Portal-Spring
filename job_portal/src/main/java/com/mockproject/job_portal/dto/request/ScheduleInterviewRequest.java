package com.mockproject.job_portal.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ScheduleInterviewRequest {

    @NotNull
    private Long applicationId;

    @NotNull
    private Long recruiterId;

    @NotNull
    private LocalDateTime startTime;

    @NotNull
    private LocalDateTime endTime;

    private String meetingLink;
    private String location;
}
