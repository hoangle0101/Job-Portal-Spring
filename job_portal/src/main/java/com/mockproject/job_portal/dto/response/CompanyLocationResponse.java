package com.mockproject.job_portal.dto.response;

import com.mockproject.job_portal.entity.CompanyLocation;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyLocationResponse {
    private Long id;
    private String address;
    private String city;
    private String country;

    public static CompanyLocationResponse from(CompanyLocation loc) {
        return CompanyLocationResponse.builder()
                .id(loc.getId())
                .address(loc.getAddress())
                .city(loc.getCity())
                .country(loc.getCountry())
                .build();
    }
}
