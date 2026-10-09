package com.mockproject.job_portal.service.impl;

import com.mockproject.job_portal.exception.BadRequestException;
import com.mockproject.job_portal.exception.ResourceNotFoundException;
import com.mockproject.job_portal.service.FileStorageService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    private Path rootLocation;

    @PostConstruct
    public void init() {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
            Files.createDirectories(this.rootLocation.resolve("avatars"));
            Files.createDirectories(this.rootLocation.resolve("resumes"));
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize upload storage directory", e);
        }
    }

    private void validateSubDirectory(String subDirectory) {
        if (subDirectory == null || subDirectory.isBlank() || subDirectory.contains("..") || subDirectory.contains("/") || subDirectory.contains("\\")) {
            throw new BadRequestException("Invalid subdirectory path: " + subDirectory);
        }
    }

    @Override
    public String storeFile(MultipartFile file, String subDirectory) {
        validateSubDirectory(subDirectory);

        if (file.isEmpty()) {
            throw new BadRequestException("Cannot store an empty file");
        }

        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        if (originalFilename.contains("..\\") || originalFilename.contains("../")) {
            throw new BadRequestException("Filename contains invalid path sequence: " + originalFilename);
        }

        String extension = "";
        int i = originalFilename.lastIndexOf('.');
        if (i > 0) {
            extension = originalFilename.substring(i);
        }

        String uniqueFileName = UUID.randomUUID() + extension;

        try {
            Path targetLocation = this.rootLocation.resolve(subDirectory).normalize();
            if (!Files.exists(targetLocation)) {
                Files.createDirectories(targetLocation);
            }
            Path destinationFile = targetLocation.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), destinationFile, StandardCopyOption.REPLACE_EXISTING);
            return uniqueFileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file " + originalFilename, e);
        }
    }

    @Override
    public Resource loadFileAsResource(String subDirectory, String fileName) {
        validateSubDirectory(subDirectory);

        try {
            Path filePath = this.rootLocation.resolve(subDirectory).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File", "name", fileName);
            }
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("File", "name", fileName);
        }
    }

    @Override
    public void deleteFile(String subDirectory, String fileName) {
        validateSubDirectory(subDirectory);

        try {
            Path filePath = this.rootLocation.resolve(subDirectory).resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Could not delete file: " + fileName, e);
        }
    }
}
