package com.mockproject.job_portal.controller;

import com.mockproject.job_portal.dto.request.ShortlistRequest;
import com.mockproject.job_portal.dto.response.ApiResponse;
import com.mockproject.job_portal.service.ShortlistService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/hiring")
public class ShortlistController {

    private final ShortlistService shortlistService;

    public ShortlistController(ShortlistService shortlistService) {
        this.shortlistService = shortlistService;
    }

    // Shortlists an application for recruiter review.
    @PostMapping("/applications/{appId}/shortlist")
    public ResponseEntity<ApiResponse<?>> shortlist(@PathVariable Long appId,
                                                     @Valid @RequestBody ShortlistRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Application shortlisted",
                shortlistService.shortlist(appId, request)));
    }
}
