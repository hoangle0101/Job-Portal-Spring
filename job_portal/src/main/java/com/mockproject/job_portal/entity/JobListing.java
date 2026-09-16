package com.mockproject.job_portal.entity;

import com.mockproject.job_portal.entity.enums.JobStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "job_listings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobListing extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "salary_range", length = 100)
    private String salaryRange;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private JobStatus status = JobStatus.OPEN;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_type_id")
    private JobType jobType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "industry_id")
    private Industry industry;

    @OneToOne(mappedBy = "jobListing", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private JobDescription jobDescription;
}
