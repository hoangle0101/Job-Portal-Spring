package com.mockproject.job_portal.service;

import com.mockproject.job_portal.dto.request.ReviewRequest;
import com.mockproject.job_portal.dto.response.ReviewResponse;
import com.mockproject.job_portal.entity.Company;
import com.mockproject.job_portal.entity.Review;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.entity.enums.Role;
import com.mockproject.job_portal.exception.AppException;
import com.mockproject.job_portal.exception.BadRequestException;
import com.mockproject.job_portal.exception.ResourceNotFoundException;
import com.mockproject.job_portal.repository.CompanyRepository;
import com.mockproject.job_portal.repository.ReviewRepository;
import com.mockproject.job_portal.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         CompanyRepository companyRepository,
                         UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
    }

    // A job seeker can review each company only once.
    @Transactional
    public ReviewResponse createReview(Long companyId, Long userId, ReviewRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Công ty", "id", companyId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (reviewRepository.existsByCompanyIdAndUserId(companyId, userId)) {
            throw new BadRequestException("Bạn đã đánh giá công ty này rồi, hãy sửa đánh giá cũ");
        }

        Review review = Review.builder()
                .company(company)
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment().trim())
                .build();
        return ReviewResponse.from(reviewRepository.save(review));
    }

    // Only the author can edit a review.
    @Transactional
    public ReviewResponse updateReview(Long companyId, Long reviewId, Long userId, ReviewRequest request) {
        Review review = findReview(companyId, reviewId);
        if (!review.getUser().getId().equals(userId)) {
            throw new AppException("Bạn chỉ có thể sửa đánh giá của mình", HttpStatus.FORBIDDEN);
        }
        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());
        return ReviewResponse.from(reviewRepository.save(review));
    }

    // The author or an admin (moderation) can delete a review.
    @Transactional
    public void deleteReview(Long companyId, Long reviewId, User currentUser) {
        Review review = findReview(companyId, reviewId);
        boolean isAuthor = review.getUser().getId().equals(currentUser.getId());
        if (!isAuthor && currentUser.getRole() != Role.ADMIN) {
            throw new AppException("Bạn chỉ có thể xóa đánh giá của mình", HttpStatus.FORBIDDEN);
        }
        reviewRepository.delete(review);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getCompanyReviews(Long companyId) {
        if (!companyRepository.existsById(companyId)) {
            throw new ResourceNotFoundException("Công ty", "id", companyId);
        }
        return reviewRepository.findByCompanyIdOrderByCreatedAtDesc(companyId)
                .stream().map(ReviewResponse::from).collect(Collectors.toList());
    }

    private Review findReview(Long companyId, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Đánh giá", "id", reviewId));
        if (!review.getCompany().getId().equals(companyId)) {
            throw new ResourceNotFoundException("Đánh giá", "id", reviewId);
        }
        return review;
    }
}
