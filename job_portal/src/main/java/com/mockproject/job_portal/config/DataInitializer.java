package com.mockproject.job_portal.config;

import com.mockproject.job_portal.entity.Industry;
import com.mockproject.job_portal.entity.JobType;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.entity.enums.Role;
import com.mockproject.job_portal.repository.IndustryRepository;
import com.mockproject.job_portal.repository.JobTypeRepository;
import com.mockproject.job_portal.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Chạy mỗi khi khởi động ứng dụng:
 * 1. Danh mục Ngành nghề / Hình thức làm việc (chỉ khi bảng trống)
 * 2. Tài khoản quản trị (không thể tự đăng ký ADMIN)
 * 3. Dữ liệu demo (DemoDataSeeder, chỉ chạy 1 lần)
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final String ADMIN_EMAIL = "admin@jobportal.com";

    private final IndustryRepository industryRepository;
    private final JobTypeRepository jobTypeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DemoDataSeeder demoDataSeeder;

    public DataInitializer(IndustryRepository industryRepository,
                           JobTypeRepository jobTypeRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           DemoDataSeeder demoDataSeeder) {
        this.industryRepository = industryRepository;
        this.jobTypeRepository = jobTypeRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.demoDataSeeder = demoDataSeeder;
    }

    @Override
    public void run(String... args) {
        // Danh mục Ngành nghề
        if (industryRepository.count() == 0) {
            industryRepository.saveAll(List.of(
                    Industry.builder().name("Công nghệ thông tin (IT)").description("Lập trình phần mềm, mạng, an toàn thông tin").build(),
                    Industry.builder().name("Tài chính & Ngân hàng").description("Kế toán, kiểm toán, ngân hàng số").build(),
                    Industry.builder().name("Marketing & Truyền thông").description("Digital marketing, SEO, quan hệ công chúng").build(),
                    Industry.builder().name("Thiết kế & Đồ họa").description("UI/UX Design, thiết kế 2D/3D").build(),
                    Industry.builder().name("Bán hàng & Kinh doanh").description("B2B, B2C Sales, phát triển thị trường").build()
            ));
        }

        // Danh mục Hình thức làm việc
        if (jobTypeRepository.count() == 0) {
            jobTypeRepository.saveAll(List.of(
                    JobType.builder().name("Full-time").build(),
                    JobType.builder().name("Part-time").build(),
                    JobType.builder().name("Remote").build(),
                    JobType.builder().name("Hybrid").build(),
                    JobType.builder().name("Thực tập sinh (Internship)").build()
            ));
        }

        // Tài khoản quản trị
        if (!userRepository.existsByEmail(ADMIN_EMAIL)) {
            userRepository.save(User.builder()
                    .email(ADMIN_EMAIL)
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("Quản trị viên")
                    .role(Role.ADMIN)
                    .isActive(true)
                    .build());
        }

        demoDataSeeder.seed();
    }
}
