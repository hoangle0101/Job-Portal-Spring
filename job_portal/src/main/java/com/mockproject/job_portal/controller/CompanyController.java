package com.mockproject.job_portal.controller;

import com.mockproject.job_portal.dto.request.CreateCompanyRequest;
import com.mockproject.job_portal.dto.response.ApiResponse;
import com.mockproject.job_portal.dto.response.CompanyResponse;
import com.mockproject.job_portal.dto.response.IndustryResponse;
import com.mockproject.job_portal.dto.response.JobTypeResponse;
import com.mockproject.job_portal.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @PostMapping("/companies")
    public ResponseEntity<ApiResponse<CompanyResponse>> createCompany(@Valid @RequestBody CreateCompanyRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Company created successfully", companyService.createCompany(request)));
    }

    @GetMapping("/companies")
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> getCompanies(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String city) {
        return ResponseEntity.ok(ApiResponse.success(companyService.getAllCompanies(keyword, city)));
    }

    @GetMapping("/companies/{id}")
    public ResponseEntity<ApiResponse<CompanyResponse>> getCompanyById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(companyService.getCompanyById(id)));
    }

    @GetMapping("/companies/recruiter/{recruiterId}")
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> getCompaniesByRecruiter(@PathVariable Long recruiterId) {
        return ResponseEntity.ok(ApiResponse.success(companyService.getCompaniesByRecruiter(recruiterId)));
    }

    @GetMapping("/industries")
    public ResponseEntity<ApiResponse<List<IndustryResponse>>> getIndustries() {
        return ResponseEntity.ok(ApiResponse.success(companyService.getAllIndustries()));
    }

    @GetMapping("/job-types")
    public ResponseEntity<ApiResponse<List<JobTypeResponse>>> getJobTypes() {
        return ResponseEntity.ok(ApiResponse.success(companyService.getAllJobTypes()));
    }
}
