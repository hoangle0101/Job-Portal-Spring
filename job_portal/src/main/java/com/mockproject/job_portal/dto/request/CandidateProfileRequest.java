package com.mockproject.job_portal.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CandidateProfileRequest {

    @NotNull
    private Long userId;

    private String bio;
    private String skills;
    private String education;
    private String experience;
    private String avatarUrl;
}
