package com.mockproject.job_portal.repository;

import com.mockproject.job_portal.entity.JobDescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JobDescriptionRepository extends JpaRepository<JobDescription, Long> {
    Optional<JobDescription> findByJobListingId(Long jobListingId);
}
