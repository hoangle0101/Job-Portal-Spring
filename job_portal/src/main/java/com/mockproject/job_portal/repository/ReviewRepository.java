package com.mockproject.job_portal.repository;

import com.mockproject.job_portal.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByCompanyIdOrderByCreatedAtDesc(Long companyId);
    boolean existsByCompanyIdAndUserId(Long companyId, Long userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.company.id = :companyId")
    Double getAverageRating(@Param("companyId") Long companyId);

    long countByCompanyId(Long companyId);
}
