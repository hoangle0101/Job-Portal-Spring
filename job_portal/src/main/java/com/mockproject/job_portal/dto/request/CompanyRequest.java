package com.mockproject.job_portal.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

// Used for both creating and updating a company. The owner is the logged-in recruiter.
@Getter
@Setter
public class CompanyRequest {

    @NotBlank(message = "Tên công ty là bắt buộc")
    private String name;

    private String website;

    // URL returned by POST /files/upload (subDir=logos).
    private String logoUrl;

    private String description;

    @NotEmpty(message = "Công ty cần có ít nhất một địa chỉ")
    @Valid
    private List<CompanyLocationRequest> locations;
}
