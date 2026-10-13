package com.mockproject.job_portal.dto.request;

import com.mockproject.job_portal.entity.enums.JobStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateJobListingRequest {

    private Long industryId;
    private Long jobTypeId;

    @NotBlank(message = "Tiêu đề công việc là bắt buộc")
    private String title;

    private String salaryRange;

    // OPEN = re-open, CLOSED = stop receiving applications.
    private JobStatus status;

    @NotBlank(message = "Mô tả công việc là bắt buộc")
    private String responsibilities;

    @NotBlank(message = "Yêu cầu ứng viên là bắt buộc")
    private String requirements;

    private String benefits;
}
