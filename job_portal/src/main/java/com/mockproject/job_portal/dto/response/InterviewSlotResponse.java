package com.mockproject.job_portal.dto.response;

import com.mockproject.job_portal.entity.InterviewSlot;
import com.mockproject.job_portal.entity.enums.InterviewStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class InterviewSlotResponse {

    private Long id;
    private Long applicationId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String meetingLink;
    private String location;
    private InterviewStatus status;

    // Converts an interview slot without exposing complete related entities.
    public static InterviewSlotResponse from(InterviewSlot slot) {
        return InterviewSlotResponse.builder()
                .id(slot.getId())
                .applicationId(slot.getApplication().getId())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .meetingLink(slot.getMeetingLink())
                .location(slot.getLocation())
                .status(slot.getStatus())
                .build();
    }
}
