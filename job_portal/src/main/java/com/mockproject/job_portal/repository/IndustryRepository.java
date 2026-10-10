package com.mockproject.job_portal.repository;

import com.mockproject.job_portal.entity.Industry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IndustryRepository extends JpaRepository<Industry, Long> {
    Optional<Industry> findByName(String name);
    boolean existsByName(String name);
}
