package com.mockproject.job_portal.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplyJobRequest {

    @NotNull
    private Long candidateId;

    @NotBlank
    private String resumeUrl;

    private String coverLetter;
}
