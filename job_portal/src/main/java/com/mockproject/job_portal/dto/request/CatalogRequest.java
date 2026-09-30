package com.mockproject.job_portal.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

// Admin create/update of an Industry or a JobType (description is only used for industries).
@Getter
@Setter
public class CatalogRequest {

    @NotBlank(message = "Tên là bắt buộc")
    private String name;

    private String description;
}
