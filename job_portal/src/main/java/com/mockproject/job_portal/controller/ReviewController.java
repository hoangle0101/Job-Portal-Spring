package com.mockproject.job_portal.controller;

import com.mockproject.job_portal.dto.request.ReviewRequest;
import com.mockproject.job_portal.dto.response.ApiResponse;
import com.mockproject.job_portal.dto.response.ReviewResponse;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    public ResponseEntity<ApiResponse<ReviewResponse>> addReview(@AuthenticationPrincipal User currentUser,
                                                                 @PathVariable Long companyId,
                                                                 @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã gửi đánh giá",
                reviewService.createReview(companyId, currentUser.getId(), request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviews(@PathVariable Long companyId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getCompanyReviews(companyId)));
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(@AuthenticationPrincipal User currentUser,
                                                                    @PathVariable Long companyId,
                                                                    @PathVariable Long reviewId,
                                                                    @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật đánh giá",
                reviewService.updateReview(companyId, reviewId, currentUser.getId(), request)));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@AuthenticationPrincipal User currentUser,
                                                          @PathVariable Long companyId,
                                                          @PathVariable Long reviewId) {
        reviewService.deleteReview(companyId, reviewId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa đánh giá", null));
    }
}
