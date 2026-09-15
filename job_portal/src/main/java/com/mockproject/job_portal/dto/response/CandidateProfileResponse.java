package com.mockproject.job_portal.dto.response;

import com.mockproject.job_portal.entity.CandidateProfile;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CandidateProfileResponse {

    private Long id;
    private Long userId;
    private String bio;
    private String skills;
    private String education;
    private String experience;
    private String resumeUrl;
    private String avatarUrl;

    // Converts the persistence entity into a response that does not expose User credentials.
    public static CandidateProfileResponse from(CandidateProfile profile) {
        return CandidateProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .bio(profile.getBio())
                .skills(profile.getSkills())
                .education(profile.getEducation())
                .experience(profile.getExperience())
                .resumeUrl(profile.getResumeUrl())
                .avatarUrl(profile.getAvatarUrl())
                .build();
    }
}
