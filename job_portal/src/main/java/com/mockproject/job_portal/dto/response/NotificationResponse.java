package com.mockproject.job_portal.dto.response;

import com.mockproject.job_portal.entity.Notification;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NotificationResponse {

    private Long id;
    private Long userId;
    private String title;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;

    // Converts a notification without exposing the related User entity.
    public static NotificationResponse from(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUser().getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
