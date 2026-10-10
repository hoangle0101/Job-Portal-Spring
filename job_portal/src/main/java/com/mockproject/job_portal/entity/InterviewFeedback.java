package com.mockproject.job_portal.entity;

import com.mockproject.job_portal.entity.enums.FeedbackResult;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interview_feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewFeedback extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "interview_slot_id", nullable = false, unique = true)
    private InterviewSlot interviewSlot;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "interviewer_id", nullable = false)
    private User interviewer;

    @Column(nullable = false)
    private Integer score;

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private FeedbackResult result;
}
