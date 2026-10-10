package com.mockproject.job_portal.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "company_locations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyLocation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false, length = 200)
    private String address;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(length = 100)
    @Builder.Default
    private String country = "Việt Nam";
}
