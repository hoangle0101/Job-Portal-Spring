package com.mockproject.job_portal.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDateTime;
import java.util.Map;
@RestController
@RequestMapping("/api/v1/health")
public class HealthCheckController {
    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "message", "Service is running smoothly!",
                "timestamp", LocalDateTime.now()
        ));
    }
}
