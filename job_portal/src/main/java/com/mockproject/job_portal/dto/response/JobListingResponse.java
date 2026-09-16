package com.mockproject.job_portal.dto.response;

import com.mockproject.job_portal.entity.JobListing;
import com.mockproject.job_portal.entity.enums.JobStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobListingResponse {
    private Long id;
    private String title;
    private String salaryRange;
    private JobStatus status;
    private Long companyId;
    private String companyName;
    private String companyLogo;
    private String companyWebsite;
    private Long jobTypeId;
    private String jobTypeName;
    private Long industryId;
    private String industryName;
    private JobDescriptionResponse description;
    private LocalDateTime createdAt;

    public static JobListingResponse from(JobListing j) {
        return JobListingResponse.builder()
                .id(j.getId())
                .title(j.getTitle())
                .salaryRange(j.getSalaryRange())
                .status(j.getStatus())
                .companyId(j.getCompany() != null ? j.getCompany().getId() : null)
                .companyName(j.getCompany() != null ? j.getCompany().getName() : null)
                .companyLogo(j.getCompany() != null ? j.getCompany().getLogoUrl() : null)
                .companyWebsite(j.getCompany() != null ? j.getCompany().getWebsite() : null)
                .jobTypeId(j.getJobType() != null ? j.getJobType().getId() : null)
                .jobTypeName(j.getJobType() != null ? j.getJobType().getName() : null)
                .industryId(j.getIndustry() != null ? j.getIndustry().getId() : null)
                .industryName(j.getIndustry() != null ? j.getIndustry().getName() : null)
                .description(JobDescriptionResponse.from(j.getJobDescription()))
                .createdAt(j.getCreatedAt())
                .build();
    }
}
