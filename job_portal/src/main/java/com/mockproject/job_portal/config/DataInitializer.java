package com.mockproject.job_portal.config;

import com.mockproject.job_portal.entity.Industry;
import com.mockproject.job_portal.entity.JobType;
import com.mockproject.job_portal.repository.IndustryRepository;
import com.mockproject.job_portal.repository.JobTypeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final IndustryRepository industryRepository;
    private final JobTypeRepository jobTypeRepository;

    public DataInitializer(IndustryRepository industryRepository, JobTypeRepository jobTypeRepository) {
        this.industryRepository = industryRepository;
        this.jobTypeRepository = jobTypeRepository;
    }

    @Override
    public void run(String... args) {
        // Tự động mồi danh mục Ngành nghề nếu CSDL trống
        if (industryRepository.count() == 0) {
            List<Industry> industries = List.of(
                    Industry.builder().name("Công nghệ thông tin (IT)").description("Lập trình phần mềm, mạng, an toàn thông tin").build(),
                    Industry.builder().name("Tài chính & Ngân hàng").description("Kế toán, kiểm toán, ngân hàng số").build(),
                    Industry.builder().name("Marketing & Truyền thông").description("Digital marketing, SEO, quan hệ công chúng").build(),
                    Industry.builder().name("Thiết kế & Đồ họa").description("UI/UX Design, thiết kế 2D/3D").build(),
                    Industry.builder().name("Bán hàng & Kinh doanh").description("B2B, B2C Sales, phát triển thị trường").build()
            );
            industryRepository.saveAll(industries);
        }

        // Tự động mồi danh mục Loại hình công việc nếu CSDL trống
        if (jobTypeRepository.count() == 0) {
            List<JobType> jobTypes = List.of(
                    JobType.builder().name("Full-time").build(),
                    JobType.builder().name("Part-time").build(),
                    JobType.builder().name("Remote").build(),
                    JobType.builder().name("Hybrid").build(),
                    JobType.builder().name("Thực tập sinh (Internship)").build()
            );
            jobTypeRepository.saveAll(jobTypes);
        }
    }
}
