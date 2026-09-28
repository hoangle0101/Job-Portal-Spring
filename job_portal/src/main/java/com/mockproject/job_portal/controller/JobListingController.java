package com.mockproject.job_portal.controller;

import com.mockproject.job_portal.dto.request.CreateJobListingRequest;
import com.mockproject.job_portal.dto.request.UpdateJobListingRequest;
import com.mockproject.job_portal.dto.response.ApiResponse;
import com.mockproject.job_portal.dto.response.JobListingResponse;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.service.JobListingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    public ResponseEntity<ApiResponse<JobListingResponse>> createJob(@AuthenticationPrincipal User currentUser,
                                                                     @Valid @RequestBody CreateJobListingRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã đăng tin tuyển dụng",
                jobListingService.createJob(currentUser.getId(), request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<JobListingResponse>> updateJob(@AuthenticationPrincipal User currentUser,
                                                                     @PathVariable Long id,
                                                                     @Valid @RequestBody UpdateJobListingRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật tin tuyển dụng",
                jobListingService.updateJob(id, currentUser.getId(), request)));
    }

    // Closes the listing (soft delete) so applications keep their history.
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> closeJob(@AuthenticationPrincipal User currentUser, @PathVariable Long id) {
        jobListingService.closeJob(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Đã đóng tin tuyển dụng", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobListingResponse>>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long industryId,
            @RequestParam(required = false) Long jobTypeId,
            @RequestParam(required = false) String city) {
        return ResponseEntity.ok(ApiResponse.success(jobListingService.searchJobs(keyword, industryId, jobTypeId, city)));
    }

    // Listings of the logged-in recruiter (declared before /{id} for readability).
    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<JobListingResponse>>> getMyJobs(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(jobListingService.getJobsByRecruiter(currentUser.getId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobListingResponse>> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(jobListingService.getJobById(id)));
    }
}
