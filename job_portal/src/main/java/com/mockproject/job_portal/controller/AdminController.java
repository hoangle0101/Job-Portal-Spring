package com.mockproject.job_portal.controller;

import com.mockproject.job_portal.dto.request.CatalogRequest;
import com.mockproject.job_portal.dto.response.ApiResponse;
import com.mockproject.job_portal.dto.response.AuthResponse;
import com.mockproject.job_portal.dto.response.IndustryResponse;
import com.mockproject.job_portal.dto.response.JobTypeResponse;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Every endpoint here requires ROLE_ADMIN (see SecurityConfig).
@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AuthResponse>>> getUsers() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getUsers()));
    }

    // Lock (active=false) or unlock (active=true) an account.
    @PutMapping("/users/{id}/active")
    public ResponseEntity<ApiResponse<AuthResponse>> setUserActive(@AuthenticationPrincipal User currentUser,
                                                                   @PathVariable Long id,
                                                                   @RequestParam boolean active) {
        return ResponseEntity.ok(ApiResponse.success(active ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản",
                adminService.setUserActive(id, active, currentUser.getId())));
    }

    @PostMapping("/industries")
    public ResponseEntity<ApiResponse<IndustryResponse>> createIndustry(@Valid @RequestBody CatalogRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã thêm ngành nghề", adminService.createIndustry(request)));
    }

    @PutMapping("/industries/{id}")
    public ResponseEntity<ApiResponse<IndustryResponse>> updateIndustry(@PathVariable Long id,
                                                                        @Valid @RequestBody CatalogRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật ngành nghề", adminService.updateIndustry(id, request)));
    }

    @DeleteMapping("/industries/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteIndustry(@PathVariable Long id) {
        adminService.deleteIndustry(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa ngành nghề", null));
    }

    @PostMapping("/job-types")
    public ResponseEntity<ApiResponse<JobTypeResponse>> createJobType(@Valid @RequestBody CatalogRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã thêm hình thức làm việc", adminService.createJobType(request)));
    }

    @PutMapping("/job-types/{id}")
    public ResponseEntity<ApiResponse<JobTypeResponse>> updateJobType(@PathVariable Long id,
                                                                      @Valid @RequestBody CatalogRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật hình thức làm việc", adminService.updateJobType(id, request)));
    }

    @DeleteMapping("/job-types/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteJobType(@PathVariable Long id) {
        adminService.deleteJobType(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa hình thức làm việc", null));
    }
}
