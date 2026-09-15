package com.mockproject.job_portal.dto.response;

import com.mockproject.job_portal.entity.JobApplication;
import com.mockproject.job_portal.entity.enums.ApplicationStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class JobApplicationResponse {

    private Long id;
    private Long jobListingId;
    private Long candidateId;
    private String resumeUrl;
    private String coverLetter;
    private ApplicationStatus status;
    private LocalDateTime createdAt;

    // Converts an application entity without exposing the complete candidate account.
    public static JobApplicationResponse from(JobApplication application) {
        return JobApplicationResponse.builder()
                .id(application.getId())
                .jobListingId(application.getJobListingId())
                .candidateId(application.getCandidate().getId())
                .resumeUrl(application.getResumeUrl())
                .coverLetter(application.getCoverLetter())
                .status(application.getStatus())
                .createdAt(application.getCreatedAt())
                .build();
    }
}
