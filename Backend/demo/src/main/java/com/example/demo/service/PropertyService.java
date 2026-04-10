package com.example.demo.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.dto.PropertyRequest;
import com.example.demo.entity.Project;
import com.example.demo.entity.Property;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.PropertyRepository;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final ProjectRepository projectRepository;

    public PropertyService(PropertyRepository propertyRepository, ProjectRepository projectRepository) {
        this.propertyRepository = propertyRepository;
        this.projectRepository = projectRepository;
    }

    public List<Property> getAll(String keyword, Long projectId, LocalDate fromDate, LocalDate toDate) {
        return propertyRepository.searchWithFilters(keyword, projectId, fromDate, toDate);
    }

    public List<Property> getByProject(Long projectId) {
        return propertyRepository.findByProjectIdOrderByIdDesc(projectId);
    }

    public Property getById(Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found: " + id));
    }

    public Property create(PropertyRequest request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found: " + request.getProjectId()));

        Property property = new Property();
        property.setProject(project);
        map(property, request);
        return propertyRepository.save(property);
    }

    public Property update(Long id, PropertyRequest request) {
        Property property = getById(id);
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found: " + request.getProjectId()));

        property.setProject(project);
        map(property, request);
        return propertyRepository.save(property);
    }

    public void delete(Long id) {
        propertyRepository.deleteById(id);
    }

    private void map(Property property, PropertyRequest request) {
        property.setPropertyName(request.getPropertyName());
        property.setPropertyType(request.getPropertyType());
        property.setUploadDate(request.getUploadDate());
        property.setDetailsLink(request.getDetailsLink());
        property.setImageLink(request.getImageLink());
    }
}