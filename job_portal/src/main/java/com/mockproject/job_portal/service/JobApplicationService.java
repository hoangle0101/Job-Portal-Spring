package com.mockproject.job_portal.service;

import com.mockproject.job_portal.dto.request.ApplyJobRequest;
import com.mockproject.job_portal.dto.response.JobApplicationResponse;
import com.mockproject.job_portal.entity.JobApplication;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.entity.enums.Role;
import com.mockproject.job_portal.exception.BadRequestException;
import com.mockproject.job_portal.exception.ResourceNotFoundException;
import com.mockproject.job_portal.repository.JobApplicationRepository;
import com.mockproject.job_portal.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public JobApplicationService(JobApplicationRepository applicationRepository, UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    // Creates an application for a job and prevents duplicate submissions.
    @Transactional
    public JobApplicationResponse apply(Long jobId, ApplyJobRequest request) {
        User candidate = findCandidate(request.getCandidateId());
        if (applicationRepository.existsByJobListingIdAndCandidateId(jobId, candidate.getId())) {
            throw new BadRequestException("Candidate has already applied to this job");
        }
        JobApplication application = JobApplication.builder()
                .jobListingId(jobId)
                .candidate(candidate)
                .resumeUrl(request.getResumeUrl())
                .coverLetter(request.getCoverLetter())
                .build();
        return JobApplicationResponse.from(applicationRepository.save(application));
    }

    // Returns all applications owned by the requested job seeker.
    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getMyApplications(Long candidateId) {
        findCandidate(candidateId);
        return applicationRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId)
                .stream()
                .map(JobApplicationResponse::from)
                .collect(Collectors.toList());
    }

    // Returns all applications for a job after verifying the reviewer's recruiter role.
    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getJobApplications(Long jobId, Long recruiterId) {
        findRecruiter(recruiterId);
        return applicationRepository.findByJobListingIdOrderByCreatedAtDesc(jobId)
                .stream()
                .map(JobApplicationResponse::from)
                .collect(Collectors.toList());
    }

    // Finds the applicant and verifies that the account is a job seeker.
    private User findCandidate(Long candidateId) {
        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", candidateId));
        if (candidate.getRole() != Role.JOB_SEEKER) {
            throw new BadRequestException("Only job seekers can apply to jobs");
        }
        return candidate;
    }

    // Finds a user and verifies that the account can review job applications.
    private User findRecruiter(Long recruiterId) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", recruiterId));
        if (recruiter.getRole() != Role.RECRUITER) {
            throw new BadRequestException("Only recruiters can review job applications");
        }
        return recruiter;
    }
}
