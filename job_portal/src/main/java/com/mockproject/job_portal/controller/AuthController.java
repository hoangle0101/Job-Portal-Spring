package com.mockproject.job_portal.controller;

import com.mockproject.job_portal.dto.request.ChangePasswordRequest;
import com.mockproject.job_portal.dto.request.LoginRequest;
import com.mockproject.job_portal.dto.request.RegisterRequest;
import com.mockproject.job_portal.dto.request.UpdateAccountRequest;
import com.mockproject.job_portal.dto.response.ApiResponse;
import com.mockproject.job_portal.dto.response.AuthResponse;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đăng ký thành công", authService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", authService.login(request)));
    }

    // @AuthenticationPrincipal = the User that JwtAuthFilter loaded from the token.
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse>> getMe(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(authService.getMe(currentUser.getId())));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse>> updateMe(@AuthenticationPrincipal User currentUser,
                                                              @Valid @RequestBody UpdateAccountRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật thông tin tài khoản",
                authService.updateMe(currentUser.getId(), request)));
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@AuthenticationPrincipal User currentUser,
                                                            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Đã đổi mật khẩu", null));
    }
}
