package com.mockproject.job_portal.service;

import com.mockproject.job_portal.dto.request.CompanyLocationRequest;
import com.mockproject.job_portal.dto.request.CompanyRequest;
import com.mockproject.job_portal.dto.response.CompanyResponse;
import com.mockproject.job_portal.dto.response.IndustryResponse;
import com.mockproject.job_portal.dto.response.JobListingResponse;
import com.mockproject.job_portal.dto.response.JobTypeResponse;
import com.mockproject.job_portal.entity.Company;
import com.mockproject.job_portal.entity.CompanyLocation;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.entity.enums.JobStatus;
import com.mockproject.job_portal.exception.AppException;
import com.mockproject.job_portal.exception.BadRequestException;
import com.mockproject.job_portal.exception.ResourceNotFoundException;
import com.mockproject.job_portal.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final IndustryRepository industryRepository;
    private final JobTypeRepository jobTypeRepository;
    private final ReviewRepository reviewRepository;
    private final JobListingRepository jobListingRepository;

    public CompanyService(CompanyRepository companyRepository,
                          UserRepository userRepository,
                          IndustryRepository industryRepository,
                          JobTypeRepository jobTypeRepository,
                          ReviewRepository reviewRepository,
                          JobListingRepository jobListingRepository) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.industryRepository = industryRepository;
        this.jobTypeRepository = jobTypeRepository;
        this.reviewRepository = reviewRepository;
        this.jobListingRepository = jobListingRepository;
    }

    // Creates a company owned by the logged-in recruiter.
    @Transactional
    public CompanyResponse createCompany(Long recruiterId, CompanyRequest request) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", recruiterId));

        String name = request.getName().trim();
        if (companyRepository.existsByName(name)) {
            throw new BadRequestException("Tên công ty đã tồn tại: " + name);
        }

        Company company = Company.builder()
                .name(name)
                .website(request.getWebsite())
                .logoUrl(request.getLogoUrl())
                .description(request.getDescription())
                .recruiter(recruiter)
                .locations(new ArrayList<>())
                .build();
        addLocations(company, request.getLocations());

        Company saved = companyRepository.save(company);
        return CompanyResponse.from(saved, 0.0, 0L);
    }

    // Updates company info; the branch list is replaced by the one sent from the form.
    @Transactional
    public CompanyResponse updateCompany(Long companyId, Long recruiterId, CompanyRequest request) {
        Company company = findOwnedCompany(companyId, recruiterId);

        String name = request.getName().trim();
        if (companyRepository.existsByNameAndIdNot(name, companyId)) {
            throw new BadRequestException("Tên công ty đã tồn tại: " + name);
        }
        company.setName(name);
        company.setWebsite(request.getWebsite());
        company.setLogoUrl(request.getLogoUrl());
        company.setDescription(request.getDescription());

        // orphanRemoval = true on Company.locations deletes the old rows.
        company.getLocations().clear();
        addLocations(company, request.getLocations());

        return toResponse(companyRepository.save(company));
    }

    // A company that already has job listings cannot be deleted (it would break hiring history).
    @Transactional
    public void deleteCompany(Long companyId, Long recruiterId) {
        Company company = findOwnedCompany(companyId, recruiterId);
        if (jobListingRepository.existsByCompanyId(companyId)) {
            throw new BadRequestException("Không thể xóa công ty đã có tin tuyển dụng. Hãy đóng các tin thay vì xóa công ty.");
        }
        reviewRepository.deleteAll(reviewRepository.findByCompanyIdOrderByCreatedAtDesc(companyId));
        companyRepository.delete(company);
    }

    @Transactional(readOnly = true)
    public List<CompanyResponse> getAllCompanies(String keyword, String city) {
        String kw = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        String ct = (city != null && !city.isBlank() && !city.equalsIgnoreCase("All")) ? city.trim() : null;

        return companyRepository.searchCompanies(kw, ct).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CompanyResponse getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Công ty", "id", id));
        return toResponse(company);
    }

    @Transactional(readOnly = true)
    public List<CompanyResponse> getCompaniesByRecruiter(Long recruiterId) {
        return companyRepository.findByRecruiterId(recruiterId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Open jobs of a company, shown on the public company page.
    @Transactional(readOnly = true)
    public List<JobListingResponse> getOpenJobsOfCompany(Long companyId) {
        if (!companyRepository.existsById(companyId)) {
            throw new ResourceNotFoundException("Công ty", "id", companyId);
        }
        return jobListingRepository.findByCompanyIdAndStatusOrderByCreatedAtDesc(companyId, JobStatus.OPEN).stream()
                .map(JobListingResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<IndustryResponse> getAllIndustries() {
        return industryRepository.findAll().stream().map(IndustryResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<JobTypeResponse> getAllJobTypes() {
        return jobTypeRepository.findAll().stream().map(JobTypeResponse::from).collect(Collectors.toList());
    }

    private void addLocations(Company company, List<CompanyLocationRequest> locations) {
        for (CompanyLocationRequest locReq : locations) {
            company.getLocations().add(CompanyLocation.builder()
                    .company(company)
                    .address(locReq.getAddress().trim())
                    .city(locReq.getCity().trim())
                    .country(locReq.getCountry() != null && !locReq.getCountry().isBlank() ? locReq.getCountry().trim() : "Việt Nam")
                    .build());
        }
    }

    // Authorization: only the recruiter who created the company can change it.
    private Company findOwnedCompany(Long companyId, Long recruiterId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Công ty", "id", companyId));
        if (!company.getRecruiter().getId().equals(recruiterId)) {
            throw new AppException("Bạn chỉ có thể quản lý công ty do mình tạo", HttpStatus.FORBIDDEN);
        }
        return company;
    }

    private CompanyResponse toResponse(Company company) {
        Double avg = reviewRepository.getAverageRating(company.getId());
        long count = reviewRepository.countByCompanyId(company.getId());
        return CompanyResponse.from(company, avg, count);
    }
}
