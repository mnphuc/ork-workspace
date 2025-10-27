package org.phc.templatejavabe.presentation.controller;

import jakarta.validation.Valid;
import org.phc.templatejavabe.domain.service.IntervalService;
import org.phc.templatejavabe.presentation.request.interval.*;
import org.phc.templatejavabe.presentation.response.interval.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/intervals")
public class IntervalController {

    private static final Logger logger = LoggerFactory.getLogger(IntervalController.class);

    @Autowired
    private IntervalService intervalService;

    @PostMapping
    public ResponseEntity<?> createInterval(@Valid @RequestBody CreateIntervalRequest request) {
        try {
            String userId = getCurrentUserId();
            logger.info("Creating interval '{}' for workspace: {} by user: {}", request.getName(), request.getWorkspaceId(), userId);
            
            IntervalResponse response = intervalService.createInterval(request, userId);
            logger.info("Interval created successfully: {}", response.getId());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error creating interval", e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to create interval", e));
        }
    }

    @GetMapping
    public ResponseEntity<?> getIntervals(@RequestParam(required = false) String workspaceId) {
        try {
            String userId = getCurrentUserId();
            logger.info("Getting intervals for workspace: {} by user: {}", workspaceId, userId);
            
            List<IntervalResponse> response = intervalService.getIntervals(workspaceId, userId);
            logger.info("Found {} intervals", response.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting intervals", e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to get intervals", e));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInterval(@PathVariable String id) {
        try {
            String userId = getCurrentUserId();
            logger.info("Getting interval: {} by user: {}", id, userId);
            
            IntervalResponse response = intervalService.getInterval(id, userId);
            logger.info("Interval retrieved successfully: {}", id);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting interval: {}", id, e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to get interval", e));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateInterval(@PathVariable String id, @Valid @RequestBody UpdateIntervalRequest request) {
        try {
            String userId = getCurrentUserId();
            logger.info("Updating interval: {} by user: {}", id, userId);
            
            IntervalResponse response = intervalService.updateInterval(id, request, userId);
            logger.info("Interval updated successfully: {}", id);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error updating interval: {}", id, e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to update interval", e));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInterval(@PathVariable String id) {
        try {
            String userId = getCurrentUserId();
            logger.info("Deleting interval: {} by user: {}", id, userId);
            
            intervalService.deleteInterval(id, userId);
            logger.info("Interval deleted successfully: {}", id);
            
            return ResponseEntity.ok(Map.of("message", "Interval deleted successfully"));
        } catch (Exception e) {
            logger.error("Error deleting interval: {}", id, e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to delete interval", e));
        }
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<?> activateInterval(@PathVariable String id) {
        try {
            String userId = getCurrentUserId();
            logger.info("Activating interval: {} by user: {}", id, userId);
            
            IntervalResponse response = intervalService.activateInterval(id, userId);
            logger.info("Interval activated successfully: {}", id);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error activating interval: {}", id, e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to activate interval", e));
        }
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateInterval(@PathVariable String id) {
        try {
            String userId = getCurrentUserId();
            logger.info("Deactivating interval: {} by user: {}", id, userId);
            
            IntervalResponse response = intervalService.deactivateInterval(id, userId);
            logger.info("Interval deactivated successfully: {}", id);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error deactivating interval: {}", id, e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to deactivate interval", e));
        }
    }

    @GetMapping("/workspace/{workspaceId}/active")
    public ResponseEntity<?> getActiveIntervals(@PathVariable String workspaceId) {
        try {
            String userId = getCurrentUserId();
            logger.info("Getting active intervals for workspace: {} by user: {}", workspaceId, userId);
            
            List<IntervalResponse> response = intervalService.getActiveIntervals(workspaceId, userId);
            logger.info("Found {} active intervals for workspace: {}", response.size(), workspaceId);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting active intervals for workspace: {}", workspaceId, e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to get active intervals", e));
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


