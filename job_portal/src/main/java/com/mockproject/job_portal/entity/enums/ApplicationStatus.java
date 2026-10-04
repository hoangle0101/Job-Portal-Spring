package com.mockproject.job_portal.entity.enums;

// Hiring pipeline: APPLIED -> SHORTLISTED -> INTERVIEW_SCHEDULED -> INTERVIEW_PASSED -> OFFERED -> HIRED / OFFER_DECLINED.
// The recruiter can move an application to REJECTED at any step before the offer.
public enum ApplicationStatus {
    APPLIED,
    SHORTLISTED,
    INTERVIEW_SCHEDULED,
    INTERVIEW_PASSED,
    OFFERED,
    HIRED,
    OFFER_DECLINED,
    REJECTED
}
