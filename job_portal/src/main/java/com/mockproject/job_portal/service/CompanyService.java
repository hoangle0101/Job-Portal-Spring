package com.mockproject.job_portal.service;

import com.mockproject.job_portal.dto.request.CompanyLocationRequest;
import com.mockproject.job_portal.dto.request.CreateCompanyRequest;
import com.mockproject.job_portal.dto.response.CompanyResponse;
import com.mockproject.job_portal.dto.response.IndustryResponse;
import com.mockproject.job_portal.dto.response.JobTypeResponse;
import com.mockproject.job_portal.entity.Company;
import com.mockproject.job_portal.entity.CompanyLocation;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.entity.enums.Role;
import com.mockproject.job_portal.exception.BadRequestException;
import com.mockproject.job_portal.exception.ResourceNotFoundException;
import com.mockproject.job_portal.repository.*;
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

    public CompanyService(CompanyRepository companyRepository,
                          UserRepository userRepository,
                          IndustryRepository industryRepository,
                          JobTypeRepository jobTypeRepository,
                          ReviewRepository reviewRepository) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.industryRepository = industryRepository;
        this.jobTypeRepository = jobTypeRepository;
        this.reviewRepository = reviewRepository;
    }

    @Transactional
    public CompanyResponse createCompany(CreateCompanyRequest request) {
        User recruiter = userRepository.findById(request.getRecruiterId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getRecruiterId()));

        if (recruiter.getRole() != Role.RECRUITER && recruiter.getRole() != Role.ADMIN) {
            throw new BadRequestException("Only recruiters can create a company");
        }

        if (companyRepository.existsByName(request.getName().trim())) {
            throw new BadRequestException("Company name already exists: " + request.getName());
        }

        Company company = Company.builder()
                .name(request.getName().trim())
                .website(request.getWebsite())
                .logoUrl(request.getLogoUrl())
                .description(request.getDescription())
                .recruiter(recruiter)
                .locations(new ArrayList<>())
                .build();

        if (request.getLocations() != null && !request.getLocations().isEmpty()) {
            for (CompanyLocationRequest locReq : request.getLocations()) {
                CompanyLocation loc = CompanyLocation.builder()
                        .company(company)
                        .address(locReq.getAddress().trim())
                        .city(locReq.getCity().trim())
                        .country(locReq.getCountry() != null ? locReq.getCountry().trim() : "Việt Nam")
                        .build();
                company.getLocations().add(loc);
            }
        }

        Company saved = companyRepository.save(company);
        return CompanyResponse.from(saved, 0.0, 0L);
    }

    @Transactional(readOnly = true)
    public List<CompanyResponse> getAllCompanies(String keyword, String city) {
        String kw = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        String ct = (city != null && !city.isBlank() && !city.equalsIgnoreCase("All")) ? city.trim() : null;

        List<Company> list = companyRepository.searchCompanies(kw, ct);
        return list.stream().map(c -> {
            Double avg = reviewRepository.getAverageRating(c.getId());
            long count = reviewRepository.countByCompanyId(c.getId());
            return CompanyResponse.from(c, avg, count);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CompanyResponse getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));
        Double avg = reviewRepository.getAverageRating(id);
        long count = reviewRepository.countByCompanyId(id);
        return CompanyResponse.from(company, avg, count);
    }

    @Transactional(readOnly = true)
    public List<CompanyResponse> getCompaniesByRecruiter(Long recruiterId) {
        return companyRepository.findByRecruiterId(recruiterId).stream().map(c -> {
            Double avg = reviewRepository.getAverageRating(c.getId());
            long count = reviewRepository.countByCompanyId(c.getId());
            return CompanyResponse.from(c, avg, count);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<IndustryResponse> getAllIndustries() {
        return industryRepository.findAll().stream().map(IndustryResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<JobTypeResponse> getAllJobTypes() {
        return jobTypeRepository.findAll().stream().map(JobTypeResponse::from).collect(Collectors.toList());
    }
}
