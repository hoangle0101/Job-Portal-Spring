package com.mockproject.job_portal.service;

import com.mockproject.job_portal.dto.request.CreateJobListingRequest;
import com.mockproject.job_portal.dto.request.UpdateJobListingRequest;
import com.mockproject.job_portal.dto.response.JobListingResponse;
import com.mockproject.job_portal.entity.*;
import com.mockproject.job_portal.entity.enums.JobStatus;
import com.mockproject.job_portal.entity.enums.Role;
import com.mockproject.job_portal.exception.BadRequestException;
import com.mockproject.job_portal.exception.ResourceNotFoundException;
import com.mockproject.job_portal.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobListingService {

    private final JobListingRepository jobListingRepository;
    private final CompanyRepository companyRepository;
    private final IndustryRepository industryRepository;
    private final JobTypeRepository jobTypeRepository;
    private final UserRepository userRepository;

    public JobListingService(JobListingRepository jobListingRepository,
                              CompanyRepository companyRepository,
                              IndustryRepository industryRepository,
                              JobTypeRepository jobTypeRepository,
                              UserRepository userRepository) {
        this.jobListingRepository = jobListingRepository;
        this.companyRepository = companyRepository;
        this.industryRepository = industryRepository;
        this.jobTypeRepository = jobTypeRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public JobListingResponse createJob(CreateJobListingRequest request) {
        User recruiter = userRepository.findById(request.getRecruiterId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getRecruiterId()));
        if (recruiter.getRole() != Role.RECRUITER && recruiter.getRole() != Role.ADMIN) {
            throw new BadRequestException("Only recruiters can post job listings");
        }

        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", request.getCompanyId()));

        Industry industry = null;
        if (request.getIndustryId() != null) {
            industry = industryRepository.findById(request.getIndustryId()).orElse(null);
        }

        JobType jobType = null;
        if (request.getJobTypeId() != null) {
            jobType = jobTypeRepository.findById(request.getJobTypeId()).orElse(null);
        }

        JobListing listing = JobListing.builder()
                .title(request.getTitle().trim())
                .salaryRange(request.getSalaryRange())
                .status(JobStatus.OPEN)
                .company(company)
                .industry(industry)
                .jobType(jobType)
                .build();

        JobDescription desc = JobDescription.builder()
                .jobListing(listing)
                .responsibilities(request.getResponsibilities())
                .requirements(request.getRequirements())
                .benefits(request.getBenefits())
                .build();

        listing.setJobDescription(desc);

        JobListing saved = jobListingRepository.save(listing);
        return JobListingResponse.from(saved);
    }

    @Transactional
    public JobListingResponse updateJob(Long id, UpdateJobListingRequest request) {
        JobListing listing = jobListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job listing", "id", id));

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            listing.setTitle(request.getTitle().trim());
        }
        if (request.getSalaryRange() != null) {
            listing.setSalaryRange(request.getSalaryRange());
        }
        if (request.getStatus() != null) {
            listing.setStatus(request.getStatus());
        }
        if (request.getIndustryId() != null) {
            listing.setIndustry(industryRepository.findById(request.getIndustryId()).orElse(null));
        }
        if (request.getJobTypeId() != null) {
            listing.setJobType(jobTypeRepository.findById(request.getJobTypeId()).orElse(null));
        }

        if (listing.getJobDescription() != null) {
            if (request.getResponsibilities() != null) listing.getJobDescription().setResponsibilities(request.getResponsibilities());
            if (request.getRequirements() != null) listing.getJobDescription().setRequirements(request.getRequirements());
            if (request.getBenefits() != null) listing.getJobDescription().setBenefits(request.getBenefits());
        }

        return JobListingResponse.from(jobListingRepository.save(listing));
    }

    @Transactional
    public void deleteOrCloseJob(Long id) {
        JobListing listing = jobListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job listing", "id", id));
        listing.setStatus(JobStatus.CLOSED);
        jobListingRepository.save(listing);
    }

    @Transactional(readOnly = true)
    public List<JobListingResponse> searchJobs(String keyword, Long industryId, Long jobTypeId, String city) {
        String kw = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        String ct = (city != null && !city.isBlank() && !city.equalsIgnoreCase("All")) ? city.trim() : null;

        List<JobListing> list = jobListingRepository.searchJobs(kw, industryId, jobTypeId, ct, JobStatus.OPEN);
        return list.stream().map(JobListingResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobListingResponse getJobById(Long id) {
        JobListing listing = jobListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job listing", "id", id));
        return JobListingResponse.from(listing);
    }

    @Transactional(readOnly = true)
    public List<JobListingResponse> getJobsByRecruiter(Long recruiterId) {
        return jobListingRepository.findByCompanyRecruiterId(recruiterId)
                .stream().map(JobListingResponse::from).collect(Collectors.toList());
    }
}
