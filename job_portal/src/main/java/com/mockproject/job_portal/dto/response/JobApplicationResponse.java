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
    private String jobTitle;
    private Long companyId;
    private String companyName;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private String candidatePhone;
    private String resumeUrl;
    private String coverLetter;
    private ApplicationStatus status;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private InterviewSlotResponse interview;
    private OfferResponse offer;

    // Converts an application entity without exposing the complete candidate account.
    public static JobApplicationResponse from(JobApplication application) {
        return from(application, null, null);
    }

    public static JobApplicationResponse from(JobApplication application,
                                              InterviewSlotResponse interview,
                                              OfferResponse offer) {
        return JobApplicationResponse.builder()
                .id(application.getId())
                .jobListingId(application.getJobListing().getId())
                .jobTitle(application.getJobListing().getTitle())
                .companyId(application.getJobListing().getCompany().getId())
                .companyName(application.getJobListing().getCompany().getName())
                .candidateId(application.getCandidate() != null ? application.getCandidate().getId() : null)
                .candidateName(application.getCandidate() != null ? application.getCandidate().getFullName() : null)
                .candidateEmail(application.getCandidate() != null ? application.getCandidate().getEmail() : null)
                .candidatePhone(application.getCandidate() != null ? application.getCandidate().getPhone() : null)
                .resumeUrl(application.getResumeUrl())
                .coverLetter(application.getCoverLetter())
                .status(application.getStatus())
                .rejectionReason(application.getRejectionReason())
                .createdAt(application.getCreatedAt())
                .interview(interview)
                .offer(offer)
                .build();
    }
}
