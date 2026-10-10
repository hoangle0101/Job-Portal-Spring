package com.mockproject.job_portal.repository;

import com.mockproject.job_portal.entity.JobType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JobTypeRepository extends JpaRepository<JobType, Long> {
    Optional<JobType> findByName(String name);
    boolean existsByName(String name);
}
