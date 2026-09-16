package com.mockproject.job_portal.controller;

import com.mockproject.job_portal.dto.request.CreateReviewRequest;
import com.mockproject.job_portal.dto.response.ApiResponse;
import com.mockproject.job_portal.dto.response.ReviewResponse;
import com.mockproject.job_portal.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/companies/{companyId}/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> addReview(
            @PathVariable Long companyId,
            @Valid @RequestBody CreateReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Review submitted successfully", reviewService.createReview(companyId, request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviews(@PathVariable Long companyId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getCompanyReviews(companyId)));
    }
}
