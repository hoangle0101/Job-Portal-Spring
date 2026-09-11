package com.mockproject.job_portal.controller;

import com.mockproject.job_portal.dto.request.CreateOfferRequest;
import com.mockproject.job_portal.dto.response.ApiResponse;
import com.mockproject.job_portal.service.OfferService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/hiring")
public class OfferController {

    private final OfferService offerService;

    public OfferController(OfferService offerService) {
        this.offerService = offerService;
    }

    // Sends an offer for an application that passed the interview stage.
    @PostMapping("/applications/{appId}/offer")
    public ResponseEntity<ApiResponse<?>> createOffer(@PathVariable Long appId,
                                                       @Valid @RequestBody CreateOfferRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Offer sent",
                offerService.createOffer(appId, request)));
    }
}
