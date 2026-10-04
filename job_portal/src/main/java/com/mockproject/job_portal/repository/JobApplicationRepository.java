package com.mockproject.job_portal.repository;

import com.mockproject.job_portal.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    // Lists a candidate's applications from newest to oldest.
    List<JobApplication> findByCandidateIdOrderByCreatedAtDesc(Long candidateId);

    // Lists all applications submitted to one job listing.
    List<JobApplication> findByJobListingIdOrderByCreatedAtDesc(Long jobListingId);

    // Prevents a candidate from applying to the same job more than once.
    boolean existsByJobListingIdAndCandidateId(Long jobListingId, Long candidateId);

    // Lists all applications submitted to jobs owned by a recruiter.
    List<JobApplication> findByJobListingCompanyRecruiterIdOrderByCreatedAtDesc(Long recruiterId);

    // Checks whether a recruiter has received an application from this candidate.
    boolean existsByCandidateIdAndJobListingCompanyRecruiterId(Long candidateId, Long recruiterId);
}
