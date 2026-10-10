package com.mockproject.job_portal.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "shortlists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shortlist extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private JobApplication application;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private User recruiter;

    @Column(columnDefinition = "TEXT")
    private String note;
}
