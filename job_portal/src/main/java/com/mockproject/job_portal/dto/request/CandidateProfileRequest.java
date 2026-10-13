package com.mockproject.job_portal.dto.request;

import lombok.Getter;
import lombok.Setter;

// The owner is taken from the JWT token, so no userId is sent by the client.
@Getter
@Setter
public class CandidateProfileRequest {

    private String bio;
    private String skills;
    private String education;
    private String experience;
}
