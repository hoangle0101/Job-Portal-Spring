package com.mockproject.job_portal.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateJobListingRequest {

    @NotNull(message = "Recruiter ID is required")
    private Long recruiterId;

    @NotNull(message = "Company ID is required")
    private Long companyId;

    private Long industryId;
    private Long jobTypeId;

    @NotBlank(message = "Job title is required")
    private String title;

    private String salaryRange;

    @NotBlank(message = "Responsibilities are required")
    private String responsibilities;

    @NotBlank(message = "Requirements are required")
    private String requirements;

    private String benefits;
}
