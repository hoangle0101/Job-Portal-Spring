package com.mockproject.job_portal.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RejectRequest {

    // Optional reason shown to the candidate.
    private String reason;
}
