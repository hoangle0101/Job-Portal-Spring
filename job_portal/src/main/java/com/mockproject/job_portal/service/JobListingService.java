package com.mockproject.job_portal.service;

import com.mockproject.job_portal.dto.request.CreateJobListingRequest;
import com.mockproject.job_portal.dto.request.UpdateJobListingRequest;
import com.mockproject.job_portal.dto.response.JobListingResponse;
import com.mockproject.job_portal.entity.*;
import com.mockproject.job_portal.entity.enums.JobStatus;
import com.mockproject.job_portal.exception.AppException;
import com.mockproject.job_portal.exception.ResourceNotFoundException;
import com.mockproject.job_portal.repository.*;
import org.springframework.http.HttpStatus;
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

    public JobListingService(JobListingRepository jobListingRepository,
                             CompanyRepository companyRepository,
                             IndustryRepository industryRepository,
                             JobTypeRepository jobTypeRepository) {
        this.jobListingRepository = jobListingRepository;
        this.companyRepository = companyRepository;
        this.industryRepository = industryRepository;
        this.jobTypeRepository = jobTypeRepository;
    }

    // Creates a job listing + its description for a company owned by the logged-in recruiter.
    @Transactional
    public JobListingResponse createJob(Long recruiterId, CreateJobListingRequest request) {
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Công ty", "id", request.getCompanyId()));
        if (!company.getRecruiter().getId().equals(recruiterId)) {
            throw new AppException("Bạn chỉ có thể đăng tin cho công ty của mình", HttpStatus.FORBIDDEN);
        }

        JobListing listing = JobListing.builder()
                .title(request.getTitle().trim())
                .salaryRange(request.getSalaryRange())
                .status(JobStatus.OPEN)
                .company(company)
                .industry(findIndustry(request.getIndustryId()))
                .jobType(findJobType(request.getJobTypeId()))
                .build();

        JobDescription desc = JobDescription.builder()
                .jobListing(listing)
                .responsibilities(request.getResponsibilities())
                .requirements(request.getRequirements())
                .benefits(request.getBenefits())
                .build();
        listing.setJobDescription(desc);

        return JobListingResponse.from(jobListingRepository.save(listing));
    }

    // Updates a listing (also used to re-open or close it through the status field).
    @Transactional
    public JobListingResponse updateJob(Long id, Long recruiterId, UpdateJobListingRequest request) {
        JobListing listing = findOwnedJob(id, recruiterId);

        listing.setTitle(request.getTitle().trim());
        listing.setSalaryRange(request.getSalaryRange());
        listing.setIndustry(findIndustry(request.getIndustryId()));
        listing.setJobType(findJobType(request.getJobTypeId()));
        if (request.getStatus() != null) {
            listing.setStatus(request.getStatus());
        }

        JobDescription desc = listing.getJobDescription();
        desc.setResponsibilities(request.getResponsibilities());
        desc.setRequirements(request.getRequirements());
        desc.setBenefits(request.getBenefits());

        return JobListingResponse.from(jobListingRepository.save(listing));
    }

    // "Delete" closes the listing so that existing applications keep their history.
    @Transactional
    public void closeJob(Long id, Long recruiterId) {
        JobListing listing = findOwnedJob(id, recruiterId);
        listing.setStatus(JobStatus.CLOSED);
        jobListingRepository.save(listing);
    }

    // Public search: only OPEN jobs are returned.
    @Transactional(readOnly = true)
    public List<JobListingResponse> searchJobs(String keyword, Long industryId, Long jobTypeId, String city) {
        String kw = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        String ct = (city != null && !city.isBlank() && !city.equalsIgnoreCase("All")) ? city.trim() : null;

        List<JobListing> list = jobListingRepository.searchJobs(kw, industryId, jobTypeId, ct, JobStatus.OPEN);
        return list.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt())) // newest first
                .map(JobListingResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobListingResponse getJobById(Long id) {
        JobListing listing = jobListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tin tuyển dụng", "id", id));
        return JobListingResponse.from(listing);
    }

    // All listings (open and closed) of the logged-in recruiter.
    @Transactional(readOnly = true)
    public List<JobListingResponse> getJobsByRecruiter(Long recruiterId) {
        return jobListingRepository.findByCompanyRecruiterId(recruiterId).stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(JobListingResponse::from)
                .collect(Collectors.toList());
    }

    // Authorization: only the recruiter who owns the company can change its listings.
    private JobListing findOwnedJob(Long id, Long recruiterId) {
        JobListing listing = jobListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tin tuyển dụng", "id", id));
        if (!listing.getCompany().getRecruiter().getId().equals(recruiterId)) {
            throw new AppException("Bạn chỉ có thể quản lý tin tuyển dụng của công ty mình", HttpStatus.FORBIDDEN);
        }
        return listing;
    }

    // Optional reference: null id means "not selected"; an unknown id is an error.
    private Industry findIndustry(Long industryId) {
        if (industryId == null) return null;
        return industryRepository.findById(industryId)
                .orElseThrow(() -> new ResourceNotFoundException("Ngành nghề", "id", industryId));
    }

    private JobType findJobType(Long jobTypeId) {
        if (jobTypeId == null) return null;
        return jobTypeRepository.findById(jobTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Hình thức làm việc", "id", jobTypeId));
    }
}
