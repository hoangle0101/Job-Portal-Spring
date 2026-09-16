package com.mockproject.job_portal.dto.request;

import com.mockproject.job_portal.entity.enums.JobStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateJobListingRequest {

    private Long recruiterId;
    private Long industryId;
    private Long jobTypeId;

    @NotBlank(message = "Job title is required")
    private String title;

    private String salaryRange;
    private JobStatus status;

    private String responsibilities;
    private String requirements;
    private String benefits;
}
