package com.mockproject.job_portal.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplyJobRequest {

    // URL returned by POST /files/upload (subDir=resumes). If empty, the default CV of the profile is used.
    private String resumeUrl;

    @Size(max = 3000, message = "Thư giới thiệu tối đa 3000 ký tự")
    private String coverLetter;
}
