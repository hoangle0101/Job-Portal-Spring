package com.mockproject.job_portal.service;

import com.mockproject.job_portal.dto.request.CreateOfferRequest;
import com.mockproject.job_portal.dto.request.OfferResponseRequest;
import com.mockproject.job_portal.dto.response.OfferResponse;
import com.mockproject.job_portal.entity.JobApplication;
import com.mockproject.job_portal.entity.Offer;
import com.mockproject.job_portal.entity.enums.ApplicationStatus;
import com.mockproject.job_portal.entity.enums.OfferStatus;
import com.mockproject.job_portal.exception.AppException;
import com.mockproject.job_portal.exception.BadRequestException;
import com.mockproject.job_portal.exception.ResourceNotFoundException;
import com.mockproject.job_portal.repository.JobApplicationRepository;
import com.mockproject.job_portal.repository.OfferRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class OfferService {

    private final JobApplicationRepository applicationRepository;
    private final OfferRepository offerRepository;
    private final JobApplicationService applicationService;
    private final NotificationService notificationService;

    public OfferService(JobApplicationRepository applicationRepository,
                        OfferRepository offerRepository,
                        JobApplicationService applicationService,
                        NotificationService notificationService) {
        this.applicationRepository = applicationRepository;
        this.offerRepository = offerRepository;
        this.applicationService = applicationService;
        this.notificationService = notificationService;
    }

    // Step 4: INTERVIEW_PASSED -> OFFERED.
    @Transactional
    public OfferResponse createOffer(Long applicationId, Long recruiterId, CreateOfferRequest request) {
        JobApplication application = applicationService.getApplicationOfRecruiter(applicationId, recruiterId);
        if (application.getStatus() != ApplicationStatus.INTERVIEW_PASSED || offerRepository.existsByApplicationId(applicationId)) {
            throw new BadRequestException("Chỉ gửi Offer cho ứng viên đã đạt phỏng vấn");
        }
        if (request.getStartDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Ngày bắt đầu làm việc không được ở quá khứ");
        }

        Offer offer = offerRepository.save(Offer.builder()
                .application(application)
                .salary(request.getSalary())
                .startDate(request.getStartDate())
                .notes(request.getNotes())
                .build());
        application.setStatus(ApplicationStatus.OFFERED);
        applicationRepository.save(application);

        notificationService.create(application.getCandidate().getId(),
                "Bạn nhận được Offer",
                "Chúc mừng! Bạn nhận được thư mời làm việc cho vị trí \"" + application.getJobListing().getTitle() + "\".");
        return OfferResponse.from(offer);
    }

    // Step 5: the candidate accepts (-> HIRED) or declines (-> OFFER_DECLINED) the offer.
    @Transactional
    public OfferResponse respond(Long offerId, Long candidateId, OfferResponseRequest request) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer", "id", offerId));
        JobApplication application = offer.getApplication();

        if (!application.getCandidate().getId().equals(candidateId)) {
            throw new AppException("Bạn chỉ có thể phản hồi Offer của mình", HttpStatus.FORBIDDEN);
        }
        if (request.getStatus() == OfferStatus.PENDING) {
            throw new BadRequestException("Phản hồi phải là ACCEPTED hoặc DECLINED");
        }
        if (offer.getStatus() != OfferStatus.PENDING) {
            throw new BadRequestException("Bạn đã phản hồi Offer này rồi");
        }

        offer.setStatus(request.getStatus());
        boolean accepted = request.getStatus() == OfferStatus.ACCEPTED;
        application.setStatus(accepted ? ApplicationStatus.HIRED : ApplicationStatus.OFFER_DECLINED);
        applicationRepository.save(application);

        notificationService.create(application.getJobListing().getCompany().getRecruiter().getId(),
                accepted ? "Ứng viên đã nhận Offer" : "Ứng viên từ chối Offer",
                application.getCandidate().getFullName() + (accepted ? " đã chấp nhận" : " đã từ chối")
                        + " Offer vị trí \"" + application.getJobListing().getTitle() + "\".");
        return OfferResponse.from(offerRepository.save(offer));
    }
}
