package com.mockproject.job_portal.controller;

import com.mockproject.job_portal.dto.request.InterviewFeedbackRequest;
import com.mockproject.job_portal.dto.response.ApiResponse;
import com.mockproject.job_portal.service.InterviewFeedbackService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/hiring")
public class InterviewFeedbackController {

    private final InterviewFeedbackService feedbackService;

    public InterviewFeedbackController(InterviewFeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    // Submits recruiter feedback for an interview slot.
    @PostMapping("/interviews/{slotId}/feedback")
    public ResponseEntity<ApiResponse<?>> addFeedback(@PathVariable Long slotId,
                                                       @Valid @RequestBody InterviewFeedbackRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Interview feedback saved",
                feedbackService.addFeedback(slotId, request)));
    }
}
