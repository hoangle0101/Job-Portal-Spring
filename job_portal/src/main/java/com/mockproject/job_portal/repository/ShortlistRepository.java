package com.mockproject.job_portal.repository;

import com.mockproject.job_portal.entity.Shortlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShortlistRepository extends JpaRepository<Shortlist, Long> {

    // Checks whether an application has already been shortlisted.
    boolean existsByApplicationId(Long applicationId);

    // Finds the shortlist record associated with an application.
    Optional<Shortlist> findByApplicationId(Long applicationId);
}
