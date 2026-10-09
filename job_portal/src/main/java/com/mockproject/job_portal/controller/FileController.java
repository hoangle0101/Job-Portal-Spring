package com.mockproject.job_portal.controller;

import com.mockproject.job_portal.dto.response.ApiResponse;
import com.mockproject.job_portal.service.FileStorageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/files")
public class FileController {

    private final FileStorageService fileStorageService;

    public FileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "subDir", defaultValue = "resumes") String subDir) {
        String fileName = fileStorageService.storeFile(file, subDir);
        String downloadUrl = "/api/v1/files/" + subDir + "/" + fileName;
        return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", Map.of(
                "fileName", fileName,
                "fileUrl", downloadUrl,
                "subDir", subDir
        )));
    }

    @GetMapping("/{subDir}/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String subDir,
            @PathVariable String fileName,
            HttpServletRequest request) {
        Resource resource = fileStorageService.loadFileAsResource(subDir, fileName);

        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ignored) {}

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
