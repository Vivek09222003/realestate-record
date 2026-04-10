package com.example.demo.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.demo.entity.Property;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByProjectIdOrderByIdDesc(Long projectId);

    @Query("""
        SELECT pr FROM Property pr
        JOIN pr.project p
        WHERE (:keyword IS NULL OR :keyword = '' OR
               LOWER(pr.propertyName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(pr.propertyType) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(p.projectName) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:projectId IS NULL OR p.id = :projectId)
          AND (:fromDate IS NULL OR pr.uploadDate >= :fromDate)
          AND (:toDate IS NULL OR pr.uploadDate <= :toDate)
        ORDER BY pr.id DESC
    """)
    List<Property> searchWithFilters(
            String keyword,
            Long projectId,
            LocalDate fromDate,
            LocalDate toDate
    );
}