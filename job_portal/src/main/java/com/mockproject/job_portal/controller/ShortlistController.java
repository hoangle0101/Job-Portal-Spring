package com.mockproject.job_portal.controller;

import com.mockproject.job_portal.dto.request.ShortlistRequest;
import com.mockproject.job_portal.dto.response.ApiResponse;
import com.mockproject.job_portal.dto.response.ShortlistResponse;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.service.ShortlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/hiring")
public class ShortlistController {

    private final ShortlistService shortlistService;

    public ShortlistController(ShortlistService shortlistService) {
        this.shortlistService = shortlistService;
    }

    // Recruiter moves an application to the shortlist.
    @PostMapping("/applications/{appId}/shortlist")
    public ResponseEntity<ApiResponse<ShortlistResponse>> shortlist(@AuthenticationPrincipal User currentUser,
                                                                    @PathVariable Long appId,
                                                                    @RequestBody ShortlistRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã đưa hồ sơ vào danh sách rút gọn",
                shortlistService.shortlist(appId, currentUser.getId(), request)));
    }
}
