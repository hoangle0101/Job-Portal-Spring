package com.mockproject.job_portal.controller;

import com.mockproject.job_portal.dto.request.ApplyJobRequest;
import com.mockproject.job_portal.dto.request.RejectRequest;
import com.mockproject.job_portal.dto.response.ApiResponse;
import com.mockproject.job_portal.dto.response.JobApplicationResponse;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.service.JobApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/applications")
public class JobApplicationController {

    private final JobApplicationService applicationService;

    public JobApplicationController(JobApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    // Job seeker applies to a job (CV uploaded before through /files/upload, or the default CV).
    @PostMapping("/jobs/{jobId}")
    public ResponseEntity<ApiResponse<JobApplicationResponse>> apply(@AuthenticationPrincipal User currentUser,
                                                                     @PathVariable Long jobId,
                                                                     @Valid @RequestBody ApplyJobRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Nộp hồ sơ thành công",
                applicationService.apply(jobId, currentUser.getId(), request)));
    }

    // Job seeker: own applications with their latest interview / offer.
    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<JobApplicationResponse>>> getMyApplications(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.getMyApplications(currentUser.getId())));
    }

    // Job seeker withdraws an application that has not been processed yet.
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> withdraw(@AuthenticationPrincipal User currentUser, @PathVariable Long id) {
        applicationService.withdraw(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Đã rút hồ sơ", null));
    }

    // Recruiter: applications to all own jobs, or to one job (jobId).
    @GetMapping("/recruiter")
    public ResponseEntity<ApiResponse<List<JobApplicationResponse>>> getRecruiterApplications(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) Long jobId) {
        return ResponseEntity.ok(ApiResponse.success(
                applicationService.getRecruiterApplications(currentUser.getId(), jobId)));
    }

    // Recruiter rejects an application.
    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<JobApplicationResponse>> reject(@AuthenticationPrincipal User currentUser,
                                                                      @PathVariable Long id,
                                                                      @RequestBody(required = false) RejectRequest request) {
        String reason = request != null ? request.getReason() : null;
        return ResponseEntity.ok(ApiResponse.success("Đã từ chối hồ sơ",
                applicationService.reject(id, currentUser.getId(), reason)));
    }
}
