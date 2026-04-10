package com.example.demo.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.dto.ProjectRequest;
import com.example.demo.entity.Project;
import com.example.demo.repository.ProjectRepository;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public List<Project> getAll(String keyword, String developer, String community, LocalDate fromDate, LocalDate toDate) {
        return projectRepository.searchWithFilters(keyword, developer, community, fromDate, toDate);
    }

    public List<String> getDevelopers() {
        return projectRepository.findDistinctDevelopers();
    }

    public List<String> getCommunities() {
        return projectRepository.findDistinctCommunities();
    }

    public Project getById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found: " + id));
    }

    public Project create(ProjectRequest request) {
        Project project = new Project();
        map(project, request);
        return projectRepository.save(project);
    }

    public Project update(Long id, ProjectRequest request) {
        Project project = getById(id);
        map(project, request);
        return projectRepository.save(project);
    }

    public void delete(Long id) {
        projectRepository.deleteById(id);
    }

    private void map(Project project, ProjectRequest request) {
        project.setProjectName(request.getProjectName());
        project.setCommunityName(request.getCommunityName());
        project.setDeveloperName(request.getDeveloperName());
        project.setUploadDate(request.getUploadDate());
        project.setDetailsLink(request.getDetailsLink());
        project.setImageLink(request.getImageLink());
    }
}