package com.mockproject.job_portal.controller;

import com.mockproject.job_portal.dto.request.ScheduleInterviewRequest;
import com.mockproject.job_portal.dto.response.ApiResponse;
import com.mockproject.job_portal.dto.response.InterviewSlotResponse;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.service.InterviewSchedulingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/hiring")
public class InterviewSchedulingController {

    private final InterviewSchedulingService schedulingService;

    public InterviewSchedulingController(InterviewSchedulingService schedulingService) {
        this.schedulingService = schedulingService;
    }

    // Recruiter schedules an interview for a shortlisted application.
    @PostMapping("/interviews/schedule")
    public ResponseEntity<ApiResponse<InterviewSlotResponse>> schedule(@AuthenticationPrincipal User currentUser,
                                                                       @Valid @RequestBody ScheduleInterviewRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã hẹn lịch phỏng vấn",
                schedulingService.schedule(currentUser.getId(), request)));
    }
}
