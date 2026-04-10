package com.example.demo.service;

import com.example.demo.dto.ImportResult;
import com.example.demo.entity.Project;
import com.example.demo.entity.Property;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.PropertyRepository;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Optional;

@Service
public class ExcelImportService {

    private final ProjectRepository projectRepository;
    private final PropertyRepository propertyRepository;

    public ExcelImportService(ProjectRepository projectRepository, PropertyRepository propertyRepository) {
        this.projectRepository = projectRepository;
        this.propertyRepository = propertyRepository;
    }

    public ImportResult importProjects(MultipartFile file) {
        ImportResult result = new ImportResult();
        validateExcelFile(file);

        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();

            if (!rowIterator.hasNext()) {
                throw new RuntimeException("Excel file is empty");
            }

            Row headerRow = rowIterator.next();
            Map<String, Integer> columns = mapColumns(headerRow);

            requireColumns(columns,
                    "projectName",
                    "communityName",
                    "developerName",
                    "uploadDate",
                    "detailsLink",
                    "imageLink"
            );

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();

                if (isRowEmpty(row)) {
                    continue;
                }

                int rowNumber = row.getRowNum() + 1;

                try {
                    String projectName = getStringCellValue(row, columns.get("projectName"));

                    if (projectName == null || projectName.trim().isEmpty()) {
                        result.addFailure("Row " + rowNumber + ": projectName is required");
                        continue;
                    }

                    Project project = new Project();
                    project.setProjectName(projectName);
                    project.setCommunityName(getStringCellValue(row, columns.get("communityName")));
                    project.setDeveloperName(getStringCellValue(row, columns.get("developerName")));
                    project.setUploadDate(getDateCellValue(row, columns.get("uploadDate")));
                    project.setDetailsLink(getStringCellValue(row, columns.get("detailsLink")));
                    project.setImageLink(getStringCellValue(row, columns.get("imageLink")));

                    projectRepository.save(project);
                    result.addSuccess();

                } catch (Exception e) {
                    result.addFailure("Row " + rowNumber + ": " + e.getMessage());
                }
            }

            return result;

        } catch (Exception e) {
            throw new RuntimeException("Failed to import projects: " + e.getMessage(), e);
        }
    }

    public ImportResult importProperties(MultipartFile file) {
        ImportResult result = new ImportResult();
        validateExcelFile(file);

        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();

            if (!rowIterator.hasNext()) {
                throw new RuntimeException("Excel file is empty");
            }

            Row headerRow = rowIterator.next();
            Map<String, Integer> columns = mapColumns(headerRow);

            requireColumns(columns,
                    "projectName",
                    "propertyName",
                    "propertyType",
                    "uploadDate",
                    "detailsLink",
                    "imageLink"
            );

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();

                if (isRowEmpty(row)) {
                    continue;
                }

                int rowNumber = row.getRowNum() + 1;

                try {
                    String projectName = getStringCellValue(row, columns.get("projectName"));
                    String propertyName = getStringCellValue(row, columns.get("propertyName"));

                    if (projectName == null || projectName.trim().isEmpty()) {
                        result.addFailure("Row " + rowNumber + ": projectName is required");
                        continue;
                    }

                    if (propertyName == null || propertyName.trim().isEmpty()) {
                        result.addFailure("Row " + rowNumber + ": propertyName is required");
                        continue;
                    }

                    Optional<Project> projectOptional = projectRepository.findByProjectName(projectName);

                    if (projectOptional.isEmpty()) {
                        result.addFailure("Row " + rowNumber + ": project not found -> " + projectName);
                        continue;
                    }

                    Property property = new Property();
                    property.setProject(projectOptional.get());
                    property.setPropertyName(propertyName);
                    property.setPropertyType(getStringCellValue(row, columns.get("propertyType")));
                    property.setUploadDate(getDateCellValue(row, columns.get("uploadDate")));
                    property.setDetailsLink(getStringCellValue(row, columns.get("detailsLink")));
                    property.setImageLink(getStringCellValue(row, columns.get("imageLink")));

                    propertyRepository.save(property);
                    result.addSuccess();

                } catch (Exception e) {
                    result.addFailure("Row " + rowNumber + ": " + e.getMessage());
                }
            }

            return result;

        } catch (Exception e) {
            throw new RuntimeException("Failed to import properties: " + e.getMessage(), e);
        }
    }

    private void validateExcelFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Please upload a non-empty Excel file");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".xlsx")) {
            throw new RuntimeException("Only .xlsx files are supported");
        }
    }

    private Map<String, Integer> mapColumns(Row headerRow) {
        Map<String, Integer> columns = new HashMap<>();

        for (Cell cell : headerRow) {
            String value = cell.getStringCellValue();
            if (value != null) {
                columns.put(value.trim(), cell.getColumnIndex());
            }
        }

        return columns;
    }

    private void requireColumns(Map<String, Integer> columns, String... requiredColumns) {
        for (String column : requiredColumns) {
            if (!columns.containsKey(column)) {
                throw new RuntimeException("Missing required column: " + column);
            }
        }
    }

    private String getStringCellValue(Row row, Integer columnIndex) {
        if (columnIndex == null) {
            return null;
        }

        Cell cell = row.getCell(columnIndex);
        if (cell == null) {
            return null;
        }

        if (cell.getCellType() == CellType.STRING) {
            return cell.getStringCellValue().trim();
        }

        if (cell.getCellType() == CellType.NUMERIC) {
            return String.valueOf((long) cell.getNumericCellValue());
        }

        if (cell.getCellType() == CellType.BOOLEAN) {
            return String.valueOf(cell.getBooleanCellValue());
        }

        return null;
    }

    private LocalDate getDateCellValue(Row row, Integer columnIndex) {
        if (columnIndex == null) {
            return null;
        }

        Cell cell = row.getCell(columnIndex);
        if (cell == null) {
            return null;
        }

        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return cell.getDateCellValue()
                    .toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate();
        }

        if (cell.getCellType() == CellType.STRING) {
            String text = cell.getStringCellValue().trim();
            if (text.isEmpty()) {
                return null;
            }
            return LocalDate.parse(text);
        }

        return null;
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) {
            return true;
        }

        for (int i = row.getFirstCellNum(); i < row.getLastCellNum(); i++) {
            if (i < 0) {
                continue;
            }

            Cell cell = row.getCell(i);
            if (cell == null) {
                continue;
            }

            if (cell.getCellType() != CellType.BLANK) {
                return false;
            }
        }

        return true;
    }
}