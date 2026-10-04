package com.mockproject.job_portal.controller;

import com.mockproject.job_portal.dto.request.InterviewFeedbackRequest;
import com.mockproject.job_portal.dto.response.ApiResponse;
import com.mockproject.job_portal.dto.response.InterviewFeedbackResponse;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.service.InterviewFeedbackService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/hiring")
public class InterviewFeedbackController {

    private final InterviewFeedbackService feedbackService;

    public InterviewFeedbackController(InterviewFeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    // Recruiter scores an interview (PASS / FAIL).
    @PostMapping("/interviews/{slotId}/feedback")
    public ResponseEntity<ApiResponse<InterviewFeedbackResponse>> addFeedback(@AuthenticationPrincipal User currentUser,
                                                                              @PathVariable Long slotId,
                                                                              @Valid @RequestBody InterviewFeedbackRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã lưu kết quả phỏng vấn",
                feedbackService.addFeedback(slotId, currentUser.getId(), request)));
    }
}
