package com.mockproject.job_portal.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateAccountRequest {

    @NotBlank(message = "Họ tên là bắt buộc")
    private String fullName;

    private String phone;

    // URL returned by POST /files/upload (subDir=avatars).
    private String avatarUrl;
}
