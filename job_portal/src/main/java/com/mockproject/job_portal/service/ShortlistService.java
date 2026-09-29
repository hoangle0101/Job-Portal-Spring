package com.mockproject.job_portal.service;

import com.mockproject.job_portal.dto.request.ShortlistRequest;
import com.mockproject.job_portal.dto.response.ShortlistResponse;
import com.mockproject.job_portal.entity.JobApplication;
import com.mockproject.job_portal.entity.Shortlist;
import com.mockproject.job_portal.entity.User;
import com.mockproject.job_portal.entity.enums.ApplicationStatus;
import com.mockproject.job_portal.exception.BadRequestException;
import com.mockproject.job_portal.exception.ResourceNotFoundException;
import com.mockproject.job_portal.repository.JobApplicationRepository;
import com.mockproject.job_portal.repository.ShortlistRepository;
import com.mockproject.job_portal.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ShortlistService {

    private final JobApplicationRepository applicationRepository;
    private final ShortlistRepository shortlistRepository;
    private final UserRepository userRepository;
    private final JobApplicationService applicationService;
    private final NotificationService notificationService;

    public ShortlistService(JobApplicationRepository applicationRepository,
                            ShortlistRepository shortlistRepository,
                            UserRepository userRepository,
                            JobApplicationService applicationService,
                            NotificationService notificationService) {
        this.applicationRepository = applicationRepository;
        this.shortlistRepository = shortlistRepository;
        this.userRepository = userRepository;
        this.applicationService = applicationService;
        this.notificationService = notificationService;
    }

    // Step 1: APPLIED -> SHORTLISTED.
    @Transactional
    public ShortlistResponse shortlist(Long applicationId, Long recruiterId, ShortlistRequest request) {
        JobApplication application = applicationService.getApplicationOfRecruiter(applicationId, recruiterId);
        if (application.getStatus() != ApplicationStatus.APPLIED || shortlistRepository.existsByApplicationId(applicationId)) {
            throw new BadRequestException("Chỉ có thể shortlist hồ sơ đang chờ duyệt");
        }
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", recruiterId));

        application.setStatus(ApplicationStatus.SHORTLISTED);
        applicationRepository.save(application);
        Shortlist shortlist = shortlistRepository.save(Shortlist.builder()
                .application(application)
                .recruiter(recruiter)
                .note(request.getNote())
                .build());

        notificationService.create(application.getCandidate().getId(),
                "Hồ sơ đã được chọn",
                "Hồ sơ của bạn cho vị trí \"" + application.getJobListing().getTitle()
                        + "\" đã vào danh sách rút gọn. Nhà tuyển dụng sẽ sớm hẹn lịch phỏng vấn.");
        return ShortlistResponse.from(shortlist);
    }
}
