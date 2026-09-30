package com.mockproject.job_portal.service;

import com.mockproject.job_portal.dto.request.CatalogRequest;
import com.mockproject.job_portal.dto.response.AuthResponse;
import com.mockproject.job_portal.dto.response.IndustryResponse;
import com.mockproject.job_portal.dto.response.JobTypeResponse;
import com.mockproject.job_portal.entity.Industry;
import com.mockproject.job_portal.entity.JobType;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.exception.BadRequestException;
import com.mockproject.job_portal.exception.ResourceNotFoundException;
import com.mockproject.job_portal.repository.IndustryRepository;
import com.mockproject.job_portal.repository.JobListingRepository;
import com.mockproject.job_portal.repository.JobTypeRepository;
import com.mockproject.job_portal.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

// Administration: lock/unlock accounts and manage the industry / job type catalogs.
@Service
public class AdminService {

    private final UserRepository userRepository;
    private final IndustryRepository industryRepository;
    private final JobTypeRepository jobTypeRepository;
    private final JobListingRepository jobListingRepository;

    public AdminService(UserRepository userRepository,
                        IndustryRepository industryRepository,
                        JobTypeRepository jobTypeRepository,
                        JobListingRepository jobListingRepository) {
        this.userRepository = userRepository;
        this.industryRepository = industryRepository;
        this.jobTypeRepository = jobTypeRepository;
        this.jobListingRepository = jobListingRepository;
    }

    // ---------- Users ----------

    @Transactional(readOnly = true)
    public List<AuthResponse> getUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(user -> AuthResponse.from(user, null))
                .collect(Collectors.toList());
    }

    // A locked account can no longer log in, and its existing token stops working (checked in JwtAuthFilter).
    @Transactional
    public AuthResponse setUserActive(Long userId, boolean active, Long adminId) {
        if (userId.equals(adminId)) {
            throw new BadRequestException("Không thể tự khóa tài khoản của chính mình");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setIsActive(active);
        return AuthResponse.from(userRepository.save(user), null);
    }

    // ---------- Industries ----------

    @Transactional
    public IndustryResponse createIndustry(CatalogRequest request) {
        String name = request.getName().trim();
        if (industryRepository.existsByName(name)) {
            throw new BadRequestException("Ngành nghề đã tồn tại: " + name);
        }
        Industry industry = Industry.builder().name(name).description(request.getDescription()).build();
        return IndustryResponse.from(industryRepository.save(industry));
    }

    @Transactional
    public IndustryResponse updateIndustry(Long id, CatalogRequest request) {
        Industry industry = industryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ngành nghề", "id", id));
        industry.setName(request.getName().trim());
        industry.setDescription(request.getDescription());
        return IndustryResponse.from(industryRepository.save(industry));
    }

    // An industry used by job listings cannot be deleted.
    @Transactional
    public void deleteIndustry(Long id) {
        if (!industryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Ngành nghề", "id", id);
        }
        if (jobListingRepository.existsByIndustryId(id)) {
            throw new BadRequestException("Không thể xóa ngành nghề đang được tin tuyển dụng sử dụng");
        }
        industryRepository.deleteById(id);
    }

    // ---------- Job types ----------

    @Transactional
    public JobTypeResponse createJobType(CatalogRequest request) {
        String name = request.getName().trim();
        if (jobTypeRepository.existsByName(name)) {
            throw new BadRequestException("Hình thức làm việc đã tồn tại: " + name);
        }
        return JobTypeResponse.from(jobTypeRepository.save(JobType.builder().name(name).build()));
    }

    @Transactional
    public JobTypeResponse updateJobType(Long id, CatalogRequest request) {
        JobType jobType = jobTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hình thức làm việc", "id", id));
        jobType.setName(request.getName().trim());
        return JobTypeResponse.from(jobTypeRepository.save(jobType));
    }

    @Transactional
    public void deleteJobType(Long id) {
        if (!jobTypeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Hình thức làm việc", "id", id);
        }
        if (jobListingRepository.existsByJobTypeId(id)) {
            throw new BadRequestException("Không thể xóa hình thức làm việc đang được tin tuyển dụng sử dụng");
        }
        jobTypeRepository.deleteById(id);
    }
}
