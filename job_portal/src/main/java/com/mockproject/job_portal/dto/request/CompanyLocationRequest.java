package com.mockproject.job_portal.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompanyLocationRequest {
    @NotBlank(message = "Địa chỉ là bắt buộc")
    private String address;

    @NotBlank(message = "Thành phố là bắt buộc")
    private String city;

    private String country = "Việt Nam";
}
