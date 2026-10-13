package com.mockproject.job_portal.dto.response;

import com.mockproject.job_portal.entity.CandidateProfile;
import com.mockproject.job_portal.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CandidateProfileResponse {

    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String bio;
    private String skills;
    private String education;
    private String experience;
    private String resumeUrl;
    private String avatarUrl;

    // Builds the response from the account and its profile (profile may be null if not created yet).
    // Never exposes the User password.
    public static CandidateProfileResponse from(User user, CandidateProfile profile) {
        return CandidateProfileResponse.builder()
                .id(profile != null ? profile.getId() : null)
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .bio(profile != null ? profile.getBio() : "")
                .skills(profile != null ? profile.getSkills() : "")
                .education(profile != null ? profile.getEducation() : "")
                .experience(profile != null ? profile.getExperience() : "")
                .resumeUrl(profile != null ? profile.getResumeUrl() : null)
                .build();
    }
}
