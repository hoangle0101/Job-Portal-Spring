package com.mockproject.job_portal.service;

import com.mockproject.job_portal.dto.request.CandidateProfileRequest;
import com.mockproject.job_portal.dto.response.CandidateProfileResponse;
import com.mockproject.job_portal.entity.CandidateProfile;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.entity.enums.Role;
import com.mockproject.job_portal.exception.AppException;
import com.mockproject.job_portal.exception.ResourceNotFoundException;
import com.mockproject.job_portal.repository.CandidateProfileRepository;
import com.mockproject.job_portal.repository.JobApplicationRepository;
import com.mockproject.job_portal.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CandidateProfileService {

    private final CandidateProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final JobApplicationRepository applicationRepository;
    private final FileStorageService fileStorageService;

    public CandidateProfileService(CandidateProfileRepository profileRepository,
                                   UserRepository userRepository,
                                   JobApplicationRepository applicationRepository,
                                   FileStorageService fileStorageService) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.fileStorageService = fileStorageService;
    }

    // Returns the profile of the logged-in job seeker (empty fields if not created yet).
    @Transactional(readOnly = true)
    public CandidateProfileResponse getProfile(Long userId) {
        User user = findCandidate(userId);
        return CandidateProfileResponse.from(user, profileRepository.findByUserId(userId).orElse(null));
    }

    // Creates or updates the profile of the logged-in job seeker.
    @Transactional
    public CandidateProfileResponse saveProfile(Long userId, CandidateProfileRequest request) {
        User user = findCandidate(userId);
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> CandidateProfile.builder().user(user).build());
        profile.setBio(request.getBio());
        profile.setSkills(request.getSkills());
        profile.setEducation(request.getEducation());
        profile.setExperience(request.getExperience());
        return CandidateProfileResponse.from(user, profileRepository.save(profile));
    }

    // Stores a CV in the resumes folder and makes it the default CV of the profile.
    @Transactional
    public CandidateProfileResponse uploadCv(Long userId, MultipartFile file) {
        User user = findCandidate(userId);
        String fileName = fileStorageService.storeFile(file, "resumes");
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> CandidateProfile.builder().user(user).build());
        profile.setResumeUrl("/api/v1/files/resumes/" + fileName);
        return CandidateProfileResponse.from(user, profileRepository.save(profile));
    }

    // A recruiter can only view the profile of a candidate who applied to one of the recruiter's jobs.
    @Transactional(readOnly = true)
    public CandidateProfileResponse getProfileForRecruiter(Long candidateId, Long recruiterId) {
        User candidate = findCandidate(candidateId);
        if (!applicationRepository.existsByCandidateIdAndJobListingCompanyRecruiterId(candidateId, recruiterId)) {
            throw new AppException("Bạn chỉ xem được hồ sơ của ứng viên đã ứng tuyển vào tin của mình", HttpStatus.FORBIDDEN);
        }
        return CandidateProfileResponse.from(candidate, profileRepository.findByUserId(candidateId).orElse(null));
    }

    // Finds a user and verifies that the account is a job seeker.
    private User findCandidate(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Ứng viên", "id", userId));
        if (user.getRole() != Role.JOB_SEEKER) {
            throw new ResourceNotFoundException("Ứng viên", "id", userId);
        }
        return user;
    }
}
