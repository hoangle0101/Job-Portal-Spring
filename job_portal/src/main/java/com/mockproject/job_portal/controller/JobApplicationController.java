package com.mockproject.job_portal.controller;

import com.mockproject.job_portal.dto.request.ApplyJobRequest;
import com.mockproject.job_portal.dto.response.ApiResponse;
import com.mockproject.job_portal.service.JobApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/applications")
public class JobApplicationController {

    private final JobApplicationService applicationService;

    public JobApplicationController(JobApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    // Submits a candidate application with a CV URL and optional cover letter.
    @PostMapping("/jobs/{jobId}/apply")
    public ResponseEntity<ApiResponse<?>> apply(@PathVariable Long jobId,
                                                 @Valid @RequestBody ApplyJobRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Application submitted",
                applicationService.apply(jobId, request)));
    }
}
