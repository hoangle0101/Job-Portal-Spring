package com.mockproject.job_portal.dto.response;

import com.mockproject.job_portal.entity.Offer;
import com.mockproject.job_portal.entity.enums.OfferStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class OfferResponse {

    private Long id;
    private Long applicationId;
    private BigDecimal salary;
    private LocalDate startDate;
    private OfferStatus status;
    private String notes;

    // Converts an offer without exposing the complete application entity.
    public static OfferResponse from(Offer offer) {
        return OfferResponse.builder()
                .id(offer.getId())
                .applicationId(offer.getApplication().getId())
                .salary(offer.getSalary())
                .startDate(offer.getStartDate())
                .status(offer.getStatus())
                .notes(offer.getNotes())
                .build();
    }
}
