package com.mockproject.job_portal.repository;

import com.mockproject.job_portal.entity.InterviewSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewSlotRepository extends JpaRepository<InterviewSlot, Long> {

    // Lists interview slots for an application from newest to oldest.
    List<InterviewSlot> findByApplicationIdOrderByStartTimeDesc(Long applicationId);
}
