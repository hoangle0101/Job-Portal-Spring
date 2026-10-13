package com.mockproject.job_portal.dto.request;

import com.mockproject.job_portal.entity.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank(message = "Email là bắt buộc")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotBlank(message = "Mật khẩu là bắt buộc")
    @Size(min = 6, message = "Mật khẩu tối thiểu 6 ký tự")
    private String password;

    @NotBlank(message = "Họ tên là bắt buộc")
    private String fullName;

    private String phone;

    // Only RECRUITER or JOB_SEEKER can register; ADMIN is created by DataInitializer.
    @NotNull(message = "Vui lòng chọn vai trò")
    private Role role;
}
