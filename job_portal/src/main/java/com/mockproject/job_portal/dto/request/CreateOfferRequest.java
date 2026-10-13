package com.mockproject.job_portal.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class CreateOfferRequest {

    @NotNull(message = "Vui lòng nhập mức lương")
    @Positive(message = "Mức lương phải lớn hơn 0")
    private BigDecimal salary;

    @NotNull(message = "Vui lòng chọn ngày bắt đầu làm việc")
    private LocalDate startDate;

    private String notes;
}
