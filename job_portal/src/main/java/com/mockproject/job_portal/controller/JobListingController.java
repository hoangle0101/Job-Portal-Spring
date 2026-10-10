package com.mockproject.job_portal.controller;

import com.mockproject.job_portal.dto.request.CreateJobListingRequest;
import com.mockproject.job_portal.dto.request.UpdateJobListingRequest;
import com.mockproject.job_portal.dto.response.ApiResponse;
import com.mockproject.job_portal.dto.response.JobListingResponse;
import com.mockproject.job_portal.service.JobListingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/jobs")
public class JobListingController {

    private final JobListingService jobListingService;

    public JobListingController(JobListingService jobListingService) {
        this.jobListingService = jobListingService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<JobListingResponse>> createJob(@Valid @RequestBody CreateJobListingRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Job listing created successfully", jobListingService.createJob(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<JobListingResponse>> updateJob(@PathVariable Long id, @Valid @RequestBody UpdateJobListingRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Job listing updated successfully", jobListingService.updateJob(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> closeJob(@PathVariable Long id) {
        jobListingService.deleteOrCloseJob(id);
        return ResponseEntity.ok(ApiResponse.success("Job listing closed successfully", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobListingResponse>>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long industryId,
            @RequestParam(required = false) Long jobTypeId,
            @RequestParam(required = false) String city) {
        return ResponseEntity.ok(ApiResponse.success(jobListingService.searchJobs(keyword, industryId, jobTypeId, city)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobListingResponse>> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(jobListingService.getJobById(id)));
    }

    @GetMapping("/recruiter/{recruiterId}")
    public ResponseEntity<ApiResponse<List<JobListingResponse>>> getJobsByRecruiter(@PathVariable Long recruiterId) {
        return ResponseEntity.ok(ApiResponse.success(jobListingService.getJobsByRecruiter(recruiterId)));
    }
}
