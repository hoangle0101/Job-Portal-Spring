package com.mockproject.job_portal.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class CreateOfferRequest {

    @NotNull
    private Long recruiterId;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal salary;

    @NotNull
    private LocalDate startDate;

    private String notes;
}
