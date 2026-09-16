package com.mockproject.job_portal.service;

import com.mockproject.job_portal.dto.request.CreateReviewRequest;
import com.mockproject.job_portal.dto.response.ReviewResponse;
import com.mockproject.job_portal.entity.Company;
import com.mockproject.job_portal.entity.Review;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.exception.BadRequestException;
import com.mockproject.job_portal.exception.ResourceNotFoundException;
import com.mockproject.job_portal.repository.CompanyRepository;
import com.mockproject.job_portal.repository.ReviewRepository;
import com.mockproject.job_portal.repository.UserRepository;
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

    @Transactional
    public ReviewResponse createReview(Long companyId, CreateReviewRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        if (reviewRepository.existsByCompanyIdAndUserId(companyId, user.getId())) {
            throw new BadRequestException("You have already reviewed this company");
        }

        Review review = Review.builder()
                .company(company)
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment().trim())
                .build();

        return ReviewResponse.from(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getCompanyReviews(Long companyId) {
        if (!companyRepository.existsById(companyId)) {
            throw new ResourceNotFoundException("Company", "id", companyId);
        }
        return reviewRepository.findByCompanyIdOrderByCreatedAtDesc(companyId)
                .stream().map(ReviewResponse::from).collect(Collectors.toList());
    }
}
