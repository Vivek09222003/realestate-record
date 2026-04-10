package com.example.demo.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;



import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.demo.entity.Project;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    Optional<Project> findByProjectName(String projectName);

    @Query("""
        SELECT p FROM Project p
        WHERE (:keyword IS NULL OR :keyword = '' OR
               LOWER(p.projectName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(p.communityName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(p.developerName) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:developer IS NULL OR :developer = '' OR p.developerName = :developer)
          AND (:community IS NULL OR :community = '' OR p.communityName = :community)
          AND (:fromDate IS NULL OR p.uploadDate >= :fromDate)
          AND (:toDate IS NULL OR p.uploadDate <= :toDate)
        ORDER BY p.id DESC
    """)
    List<Project> searchWithFilters(
            String keyword,
            String developer,
            String community,
            LocalDate fromDate,
            LocalDate toDate
    );

    @Query("SELECT DISTINCT p.developerName FROM Project p WHERE p.developerName IS NOT NULL AND p.developerName <> '' ORDER BY p.developerName")
    List<String> findDistinctDevelopers();

    @Query("SELECT DISTINCT p.communityName FROM Project p WHERE p.communityName IS NOT NULL AND p.communityName <> '' ORDER BY p.communityName")
    List<String> findDistinctCommunities();
}