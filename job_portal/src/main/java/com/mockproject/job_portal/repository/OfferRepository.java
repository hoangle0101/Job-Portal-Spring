package com.mockproject.job_portal.repository;

import com.mockproject.job_portal.entity.Offer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OfferRepository extends JpaRepository<Offer, Long> {

    // Finds the offer associated with an application.
    Optional<Offer> findByApplicationId(Long applicationId);

    // Prevents more than one offer from being created for an application.
    boolean existsByApplicationId(Long applicationId);
}
