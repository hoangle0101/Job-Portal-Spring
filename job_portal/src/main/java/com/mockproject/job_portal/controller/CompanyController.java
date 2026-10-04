package com.mockproject.job_portal.controller;

import com.mockproject.job_portal.dto.request.CompanyRequest;
import com.mockproject.job_portal.dto.response.*;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    public ResponseEntity<ApiResponse<CompanyResponse>> createCompany(@AuthenticationPrincipal User currentUser,
                                                                      @Valid @RequestBody CompanyRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã tạo công ty",
                companyService.createCompany(currentUser.getId(), request)));
    }

    @PutMapping("/companies/{id}")
    public ResponseEntity<ApiResponse<CompanyResponse>> updateCompany(@AuthenticationPrincipal User currentUser,
                                                                      @PathVariable Long id,
                                                                      @Valid @RequestBody CompanyRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật công ty",
                companyService.updateCompany(id, currentUser.getId(), request)));
    }

    @DeleteMapping("/companies/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCompany(@AuthenticationPrincipal User currentUser,
                                                           @PathVariable Long id) {
        companyService.deleteCompany(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Đã xóa công ty", null));
    }

    @GetMapping("/companies")
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> getCompanies(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String city) {
        return ResponseEntity.ok(ApiResponse.success(companyService.getAllCompanies(keyword, city)));
    }

    // Companies owned by the logged-in recruiter.
    @GetMapping("/companies/mine")
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> getMyCompanies(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(companyService.getCompaniesByRecruiter(currentUser.getId())));
    }

    @GetMapping("/companies/{id}")
    public ResponseEntity<ApiResponse<CompanyResponse>> getCompanyById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(companyService.getCompanyById(id)));
    }

    @GetMapping("/companies/{id}/jobs")
    public ResponseEntity<ApiResponse<List<JobListingResponse>>> getCompanyJobs(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(companyService.getOpenJobsOfCompany(id)));
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
