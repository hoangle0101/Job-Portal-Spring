package com.mockproject.job_portal.service;

import com.mockproject.job_portal.dto.response.NotificationResponse;
import com.mockproject.job_portal.entity.Notification;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.exception.ResourceNotFoundException;
import com.mockproject.job_portal.repository.NotificationRepository;
import com.mockproject.job_portal.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // Creates a notification for a user during a hiring workflow.
    @Transactional
    public NotificationResponse create(Long userId, String title, String message) {
        User user = findUser(userId);
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .isRead(false)
                .build();
        return NotificationResponse.from(notificationRepository.save(notification));
    }

    // Returns a user's notifications from newest to oldest.
    @Transactional(readOnly = true)
    public List<NotificationResponse> getForUser(Long userId) {
        findUser(userId);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::from)
                .collect(Collectors.toList());
    }

    // Marks a notification as read only when it belongs to the requested user.
    @Transactional
    public NotificationResponse markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        if (!notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification", "id", notificationId);
        }
        notification.setIsRead(true);
        return NotificationResponse.from(notificationRepository.save(notification));
    }

    // Finds a user or raises a consistent API 404 error.
    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }
}
