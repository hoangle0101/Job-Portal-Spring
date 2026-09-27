package com.mockproject.job_portal.service;

import com.mockproject.job_portal.dto.request.ChangePasswordRequest;
import com.mockproject.job_portal.dto.request.LoginRequest;
import com.mockproject.job_portal.dto.request.RegisterRequest;
import com.mockproject.job_portal.dto.request.UpdateAccountRequest;
import com.mockproject.job_portal.dto.response.AuthResponse;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.entity.enums.Role;
import com.mockproject.job_portal.exception.AppException;
import com.mockproject.job_portal.exception.BadRequestException;
import com.mockproject.job_portal.exception.ResourceNotFoundException;
import com.mockproject.job_portal.repository.UserRepository;
import com.mockproject.job_portal.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // Creates a RECRUITER or JOB_SEEKER account (password hashed with BCrypt) and logs the user in.
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.getRole() == Role.ADMIN) {
            throw new BadRequestException("Không thể tự đăng ký tài khoản quản trị viên");
        }
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email đã được sử dụng: " + email);
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .phone(request.getPhone())
                .role(request.getRole())
                .isActive(true)
                .build();

        User saved = userRepository.save(user);
        return AuthResponse.from(saved, jwtUtil.generateToken(saved));
    }

    // Checks email + password and returns a signed JWT token.
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new BadRequestException("Email hoặc mật khẩu không chính xác"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Email hoặc mật khẩu không chính xác");
        }
        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new AppException("Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên", HttpStatus.FORBIDDEN);
        }
        return AuthResponse.from(user, jwtUtil.generateToken(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse getMe(Long userId) {
        return AuthResponse.from(findUser(userId), null);
    }

    // Updates name, phone and avatar of the logged-in user.
    @Transactional
    public AuthResponse updateMe(Long userId, UpdateAccountRequest request) {
        User user = findUser(userId);
        user.setFullName(request.getFullName().trim());
        user.setPhone(request.getPhone());
        user.setAvatarUrl(request.getAvatarUrl());
        return AuthResponse.from(userRepository.save(user), null);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = findUser(userId);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Mật khẩu hiện tại không chính xác");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }
}
