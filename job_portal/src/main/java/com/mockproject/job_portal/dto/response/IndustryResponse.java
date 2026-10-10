package com.mockproject.job_portal.dto.response;

import com.mockproject.job_portal.entity.Industry;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IndustryResponse {
    private Long id;
    private String name;
    private String description;

    public static IndustryResponse from(Industry i) {
        return IndustryResponse.builder()
                .id(i.getId())
                .name(i.getName())
                .description(i.getDescription())
                .build();
    }
}
