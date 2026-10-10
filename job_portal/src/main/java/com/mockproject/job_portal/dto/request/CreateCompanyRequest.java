package com.mockproject.job_portal.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateCompanyRequest {

    @NotNull(message = "Recruiter ID is required")
    private Long recruiterId;

    @NotBlank(message = "Company name is required")
    private String name;

    private String website;
    private String logoUrl;
    private String description;

    private List<CompanyLocationRequest> locations;
}
