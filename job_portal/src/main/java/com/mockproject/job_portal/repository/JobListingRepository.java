package com.mockproject.job_portal.repository;

import com.mockproject.job_portal.entity.JobListing;
import com.mockproject.job_portal.entity.enums.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobListingRepository extends JpaRepository<JobListing, Long> {
    List<JobListing> findByCompanyId(Long companyId);
    List<JobListing> findByCompanyRecruiterId(Long recruiterId);

    @Query("SELECT DISTINCT j FROM JobListing j " +
           "JOIN FETCH j.company c " +
           "LEFT JOIN j.jobType jt " +
           "LEFT JOIN j.industry ind " +
           "LEFT JOIN c.locations loc " +
           "WHERE (:status IS NULL OR j.status = :status) " +
           "AND (:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:industryId IS NULL OR ind.id = :industryId) " +
           "AND (:jobTypeId IS NULL OR jt.id = :jobTypeId) " +
           "AND (:city IS NULL OR LOWER(loc.city) LIKE LOWER(CONCAT('%', :city, '%')))")
    List<JobListing> searchJobs(@Param("keyword") String keyword,
                               @Param("industryId") Long industryId,
                               @Param("jobTypeId") Long jobTypeId,
                               @Param("city") String city,
                               @Param("status") JobStatus status);
}
