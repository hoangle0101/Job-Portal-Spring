package com.mockproject.job_portal.dto.response;

import com.mockproject.job_portal.entity.JobDescription;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobDescriptionResponse {
    private Long id;
    private String responsibilities;
    private String requirements;
    private String benefits;

    public static JobDescriptionResponse from(JobDescription jd) {
        if (jd == null) return null;
        return JobDescriptionResponse.builder()
                .id(jd.getId())
                .responsibilities(jd.getResponsibilities())
                .requirements(jd.getRequirements())
                .benefits(jd.getBenefits())
                .build();
    }
}
