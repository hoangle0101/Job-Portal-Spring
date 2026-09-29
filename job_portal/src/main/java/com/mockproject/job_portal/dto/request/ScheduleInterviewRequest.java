package com.mockproject.job_portal.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ScheduleInterviewRequest {

    @NotNull(message = "Thiếu mã đơn ứng tuyển")
    private Long applicationId;

    @NotNull(message = "Vui lòng chọn giờ bắt đầu")
    private LocalDateTime startTime;

    @NotNull(message = "Vui lòng chọn giờ kết thúc")
    private LocalDateTime endTime;

    private String meetingLink;
    private String location;
}
