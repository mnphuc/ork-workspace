package org.phc.templatejavabe.presentation.controller;

import org.phc.templatejavabe.domain.service.HomeService;
import org.phc.templatejavabe.presentation.response.home.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/home")
public class HomeController {

    private static final Logger logger = LoggerFactory.getLogger(HomeController.class);

    @Autowired
    private HomeService homeService;

    @GetMapping("/summary")
    public ResponseEntity<?> getHomeSummary() {
        try {
            String userId = getCurrentUserId();
            logger.info("Getting home summary for user: {}", userId);
            
            HomeSummaryResponse response = homeService.getHomeSummary(userId);
            logger.info("Home summary retrieved successfully for user: {}", userId);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting home summary", e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to get home summary", e));
        }
    }

    @GetMapping("/personal-objectives")
    public ResponseEntity<?> getPersonalObjectives() {
        try {
            String userId = getCurrentUserId();
            logger.info("Getting personal objectives for user: {}", userId);
            
            List<PersonalObjectiveResponse> response = homeService.getPersonalObjectives(userId);
            logger.info("Personal objectives retrieved successfully for user: {}, count: {}", userId, response.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting personal objectives", e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to get personal objectives", e));
        }
    }

    @GetMapping("/groups")
    public ResponseEntity<?> getUserGroups() {
        try {
            String userId = getCurrentUserId();
            logger.info("Getting user groups for user: {}", userId);
            
            List<GroupInfoResponse> response = homeService.getUserGroups(userId);
            logger.info("User groups retrieved successfully for user: {}, count: {}", userId, response.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting user groups", e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to get user groups", e));
        }
    }

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            logger.warn("User not authenticated - auth: {}, authenticated: {}, name: {}", 
                auth, auth != null ? auth.isAuthenticated() : false, 
                auth != null ? auth.getName() : "null");
            throw new RuntimeException("User not authenticated");
        }
        String userId = auth.getName();
        logger.debug("Extracted userId from authentication: {}", userId);
        return userId;
    }

    private Map<String, Object> createErrorResponse(String message, Exception e) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", message);
        errorResponse.put("message", e.getMessage());
        errorResponse.put("type", e.getClass().getSimpleName());
        errorResponse.put("timestamp", java.time.Instant.now().toString());
        
        // Include stack trace for debugging
        java.io.StringWriter sw = new java.io.StringWriter();
        java.io.PrintWriter pw = new java.io.PrintWriter(sw);
        e.printStackTrace(pw);
        errorResponse.put("stackTrace", sw.toString());
        
        return errorResponse;
    }
}
