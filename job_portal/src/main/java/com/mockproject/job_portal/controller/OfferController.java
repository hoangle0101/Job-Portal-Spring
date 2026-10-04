package com.mockproject.job_portal.controller;

import com.mockproject.job_portal.dto.request.CreateOfferRequest;
import com.mockproject.job_portal.dto.request.OfferResponseRequest;
import com.mockproject.job_portal.dto.response.ApiResponse;
import com.mockproject.job_portal.dto.response.OfferResponse;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.service.OfferService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/hiring")
public class OfferController {

    private final OfferService offerService;

    public OfferController(OfferService offerService) {
        this.offerService = offerService;
    }

    // Recruiter sends an offer to a candidate who passed the interview.
    @PostMapping("/applications/{appId}/offer")
    public ResponseEntity<ApiResponse<OfferResponse>> createOffer(@AuthenticationPrincipal User currentUser,
                                                                  @PathVariable Long appId,
                                                                  @Valid @RequestBody CreateOfferRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã gửi Offer",
                offerService.createOffer(appId, currentUser.getId(), request)));
    }

    // Candidate accepts or declines the offer.
    @PutMapping("/offers/{offerId}/respond")
    public ResponseEntity<ApiResponse<OfferResponse>> respond(@AuthenticationPrincipal User currentUser,
                                                              @PathVariable Long offerId,
                                                              @Valid @RequestBody OfferResponseRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã gửi phản hồi Offer",
                offerService.respond(offerId, currentUser.getId(), request)));
    }
}
