package com.mockproject.job_portal.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShortlistRequest {

    @NotNull
    private Long recruiterId;

    private String note;
}
