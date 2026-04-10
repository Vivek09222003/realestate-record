package com.example.demo.controller;

import com.example.demo.dto.ImportResult;
import com.example.demo.service.ExcelImportService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/import")
public class ImportController {

    private final ExcelImportService excelImportService;

    public ImportController(ExcelImportService excelImportService) {
        this.excelImportService = excelImportService;
    }

    @PostMapping("/projects")
    public ImportResult importProjects(@RequestParam("file") MultipartFile file) {
        return excelImportService.importProjects(file);
    }

    @PostMapping("/properties")
    public ImportResult importProperties(@RequestParam("file") MultipartFile file) {
        return excelImportService.importProperties(file);
    }
}