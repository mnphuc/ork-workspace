package org.phc.templatejavabe.presentation.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    private static final Logger logger = LoggerFactory.getLogger(TestController.class);

    @GetMapping("/health")
    public Map<String, Object> health() {
        logger.info("=== TEST CONTROLLER HEALTH CHECK ===");
        logger.info("API endpoint /api/test/health called");
        
        return Map.of(
            "status", "OK",
            "message", "Backend API is working!",
            "timestamp", Instant.now().toString(),
            "java_version", System.getProperty("java.version"),
            "spring_profile", System.getProperty("spring.profiles.active", "default")
        );
    }

    @GetMapping("/security")
    public Map<String, Object> security() {
        logger.info("=== TEST CONTROLLER SECURITY CHECK ===");
        logger.info("API endpoint /api/test/security called - This should be public");
        
        return Map.of(
            "status", "OK",
            "message", "Security configuration is working!",
            "timestamp", Instant.now().toString(),
            "note", "This endpoint is accessible without authentication"
        );
    }
}


