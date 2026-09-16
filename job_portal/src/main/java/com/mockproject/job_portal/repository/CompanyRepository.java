package com.mockproject.job_portal.repository;

import com.mockproject.job_portal.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByName(String name);
    boolean existsByName(String name);
    List<Company> findByRecruiterId(Long recruiterId);

    @Query("SELECT DISTINCT c FROM Company c LEFT JOIN c.locations loc " +
           "WHERE (:keyword IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:city IS NULL OR LOWER(loc.city) LIKE LOWER(CONCAT('%', :city, '%')))")
    List<Company> searchCompanies(@Param("keyword") String keyword, @Param("city") String city);
}
