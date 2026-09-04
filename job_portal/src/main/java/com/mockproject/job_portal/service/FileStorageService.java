package com.mockproject.job_portal.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String storeFile(MultipartFile file, String subDirectory);
    Resource loadFileAsResource(String subDirectory, String fileName);
    void deleteFile(String subDirectory, String fileName);
}
