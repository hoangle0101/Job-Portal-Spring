package com.mockproject.job_portal.repository;

import com.mockproject.job_portal.entity.CandidateProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CandidateProfileRepository extends JpaRepository<CandidateProfile, Long> {

    // Finds the profile owned by a specific user.
    Optional<CandidateProfile> findByUserId(Long userId);
}
