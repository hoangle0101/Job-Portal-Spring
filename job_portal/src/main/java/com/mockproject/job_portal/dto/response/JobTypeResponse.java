package com.mockproject.job_portal.dto.response;

import com.mockproject.job_portal.entity.JobType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobTypeResponse {
    private Long id;
    private String name;

    public static JobTypeResponse from(JobType jt) {
        return JobTypeResponse.builder()
                .id(jt.getId())
                .name(jt.getName())
                .build();
    }
}
