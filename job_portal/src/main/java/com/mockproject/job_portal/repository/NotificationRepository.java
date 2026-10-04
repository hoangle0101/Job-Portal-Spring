package com.mockproject.job_portal.repository;

import com.mockproject.job_portal.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Lists a user's notifications from newest to oldest.
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
}
