package com.mockproject.job_portal.controller;

import com.mockproject.job_portal.dto.request.CandidateProfileRequest;
import com.mockproject.job_portal.dto.response.ApiResponse;
import com.mockproject.job_portal.service.CandidateProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/candidates")
public class CandidateProfileController {

    private final CandidateProfileService profileService;

    public CandidateProfileController(CandidateProfileService profileService) {
        this.profileService = profileService;
    }

    // Creates or updates a candidate profile.
    @PostMapping("/profile")
    public ResponseEntity<ApiResponse<?>> saveProfile(@Valid @RequestBody CandidateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Candidate profile saved", profileService.saveProfile(request)));
    }

    // Gets a candidate profile by its owner's user id.
    @GetMapping("/profile/{userId}")
    public ResponseEntity<ApiResponse<?>> getProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(profileService.getProfile(userId)));
    }
}
