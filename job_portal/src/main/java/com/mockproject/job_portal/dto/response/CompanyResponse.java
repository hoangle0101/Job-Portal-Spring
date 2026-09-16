package com.mockproject.job_portal.dto.response;

import com.mockproject.job_portal.entity.Company;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyResponse {
    private Long id;
    private String name;
    private String website;
    private String logoUrl;
    private String description;
    private Long recruiterId;
    private List<CompanyLocationResponse> locations;
    private Double averageRating;
    private Long reviewCount;
    private LocalDateTime createdAt;

    public static CompanyResponse from(Company c, Double avgRating, Long count) {
        return CompanyResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .website(c.getWebsite())
                .logoUrl(c.getLogoUrl())
                .description(c.getDescription())
                .recruiterId(c.getRecruiter().getId())
                .locations(c.getLocations() != null ? c.getLocations().stream().map(CompanyLocationResponse::from).collect(Collectors.toList()) : List.of())
                .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                .reviewCount(count != null ? count : 0L)
                .createdAt(c.getCreatedAt())
                .build();
    }
}
