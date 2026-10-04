package com.mockproject.job_portal.controller;

import com.mockproject.job_portal.dto.request.CandidateProfileRequest;
import com.mockproject.job_portal.dto.response.ApiResponse;
import com.mockproject.job_portal.dto.response.CandidateProfileResponse;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.service.CandidateProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/candidates")
public class CandidateProfileController {

    private final CandidateProfileService profileService;

    public CandidateProfileController(CandidateProfileService profileService) {
        this.profileService = profileService;
    }

    // Job seeker: view own profile.
    @GetMapping("/me/profile")
    public ResponseEntity<ApiResponse<CandidateProfileResponse>> getMyProfile(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(profileService.getProfile(currentUser.getId())));
    }

    // Job seeker: create or update own profile.
    @PostMapping("/me/profile")
    public ResponseEntity<ApiResponse<CandidateProfileResponse>> saveMyProfile(@AuthenticationPrincipal User currentUser,
                                                                               @RequestBody CandidateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã lưu hồ sơ",
                profileService.saveProfile(currentUser.getId(), request)));
    }

    // Job seeker: upload the default CV.
    @PostMapping("/me/upload-cv")
    public ResponseEntity<ApiResponse<CandidateProfileResponse>> uploadCv(@AuthenticationPrincipal User currentUser,
                                                                          @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Đã tải lên CV",
                profileService.uploadCv(currentUser.getId(), file)));
    }

    // Recruiter: view the profile of a candidate who applied to one of their jobs.
    @GetMapping("/{userId}/profile")
    public ResponseEntity<ApiResponse<CandidateProfileResponse>> getCandidateProfile(@AuthenticationPrincipal User currentUser,
                                                                                     @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(profileService.getProfileForRecruiter(userId, currentUser.getId())));
    }
}
