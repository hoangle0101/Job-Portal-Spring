package com.mockproject.job_portal.dto.request;

import com.mockproject.job_portal.entity.enums.OfferStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OfferResponseRequest {

    // ACCEPTED or DECLINED
    @NotNull(message = "Vui lòng chọn Chấp nhận hoặc Từ chối")
    private OfferStatus status;
}
