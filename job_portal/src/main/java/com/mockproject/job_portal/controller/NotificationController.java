package com.mockproject.job_portal.controller;

import com.mockproject.job_portal.dto.response.ApiResponse;
import com.mockproject.job_portal.dto.response.NotificationResponse;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // Notifications of the logged-in user.
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getForUser(currentUser.getId())));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(@AuthenticationPrincipal User currentUser,
                                                                        @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu đã đọc",
                notificationService.markAsRead(id, currentUser.getId())));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@AuthenticationPrincipal User currentUser) {
        notificationService.markAllAsRead(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu tất cả đã đọc", null));
    }
}
