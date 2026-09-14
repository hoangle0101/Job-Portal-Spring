package com.mockproject.job_portal.controller;

import com.mockproject.job_portal.dto.response.ApiResponse;
import com.mockproject.job_portal.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // Gets notifications belonging to the requested user.
    @GetMapping
    public ResponseEntity<ApiResponse<?>> getNotifications(@RequestParam Long userId) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getForUser(userId)));
    }

    // Marks one notification as read after verifying that it belongs to the user.
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<?>> markAsRead(@PathVariable Long id,
                                                      @RequestParam Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read",
                notificationService.markAsRead(id, userId)));
    }
}
