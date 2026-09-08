package com.mockproject.job_portal.service;

import com.mockproject.job_portal.dto.request.CandidateProfileRequest;
import com.mockproject.job_portal.dto.response.CandidateProfileResponse;
import com.mockproject.job_portal.entity.CandidateProfile;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.entity.enums.Role;
import com.mockproject.job_portal.exception.BadRequestException;
import com.mockproject.job_portal.exception.ResourceNotFoundException;
import com.mockproject.job_portal.repository.CandidateProfileRepository;
import com.mockproject.job_portal.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CandidateProfileService {

    private final CandidateProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public CandidateProfileService(CandidateProfileRepository profileRepository, UserRepository userRepository,
                                   FileStorageService fileStorageService) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    // Creates or updates the profile belonging to a job seeker.
    @Transactional
    public CandidateProfileResponse saveProfile(CandidateProfileRequest request) {
        User user = findCandidate(request.getUserId());
        CandidateProfile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> CandidateProfile.builder().user(user).build());
        profile.setBio(request.getBio());
        profile.setSkills(request.getSkills());
        profile.setEducation(request.getEducation());
        profile.setExperience(request.getExperience());
        profile.setAvatarUrl(request.getAvatarUrl());
        return CandidateProfileResponse.from(profileRepository.save(profile));
    }

    // Returns a candidate profile without exposing the associated user's password.
    @Transactional(readOnly = true)
    public CandidateProfileResponse getProfile(Long userId) {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile", "userId", userId));
        return CandidateProfileResponse.from(profile);
    }

    // Stores a CV in the resumes directory and updates the candidate profile URL.
    @Transactional
    public CandidateProfileResponse uploadCv(Long userId, MultipartFile file) {
        User user = findCandidate(userId);
        String fileName = fileStorageService.storeFile(file, "resumes");
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> CandidateProfile.builder().user(user).build());
        profile.setResumeUrl("/api/v1/files/resumes/" + fileName);
        return CandidateProfileResponse.from(profileRepository.save(profile));
    }

    // Finds a user and verifies that the profile owner has the candidate role.
    private User findCandidate(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        if (user.getRole() != Role.JOB_SEEKER) {
            throw new BadRequestException("Only job seekers can manage candidate profiles");
        }
        return user;
    }
}
