package com.mockproject.job_portal.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateJobListingRequest {

    @NotNull(message = "Vui lòng chọn công ty")
    private Long companyId;

    private Long industryId;
    private Long jobTypeId;

    @NotBlank(message = "Tiêu đề công việc là bắt buộc")
    private String title;

    private String salaryRange;

    @NotBlank(message = "Mô tả công việc là bắt buộc")
    private String responsibilities;

    @NotBlank(message = "Yêu cầu ứng viên là bắt buộc")
    private String requirements;

    private String benefits;
}
