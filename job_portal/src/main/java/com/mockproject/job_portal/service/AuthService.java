package com.mockproject.job_portal.service;

import com.mockproject.job_portal.dto.request.LoginRequest;
import com.mockproject.job_portal.dto.request.RegisterRequest;
import com.mockproject.job_portal.dto.response.AuthResponse;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.exception.BadRequestException;
import com.mockproject.job_portal.exception.ResourceNotFoundException;
import com.mockproject.job_portal.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail().trim().toLowerCase())
                .password(request.getPassword()) // Plain text or hashed
                .fullName(request.getFullName().trim())
                .phone(request.getPhone())
                .role(request.getRole())
                .isActive(true)
                .build();

        User saved = userRepository.save(user);
        String token = "jwt_" + UUID.randomUUID();
        return AuthResponse.from(saved, token);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new BadRequestException("Account has been deactivated");
        }

        String token = "jwt_" + UUID.randomUUID();
        return AuthResponse.from(user, token);
    }

    @Transactional(readOnly = true)
    public AuthResponse getMe(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return AuthResponse.from(user, null);
    }
}
