package com.mockproject.job_portal.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "job_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobType extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String name;
}
