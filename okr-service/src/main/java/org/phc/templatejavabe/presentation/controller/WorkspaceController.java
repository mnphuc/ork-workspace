package org.phc.templatejavabe.presentation.controller;

import jakarta.validation.Valid;
import org.phc.templatejavabe.domain.service.WorkspaceService;
import org.phc.templatejavabe.presentation.request.workspace.*;
import org.phc.templatejavabe.presentation.response.workspace.*;
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
@RequestMapping("/workspaces")
public class WorkspaceController {

    private static final Logger logger = LoggerFactory.getLogger(WorkspaceController.class);

    @Autowired
    private WorkspaceService workspaceService;

    @PostMapping
    public ResponseEntity<?> createWorkspace(@Valid @RequestBody CreateWorkspaceRequest request) {
        try {
            String userId = getCurrentUserId();
            logger.info("Creating workspace '{}' for user: {}", request.getName(), userId);
            
            WorkspaceResponse response = workspaceService.createWorkspace(request, userId);
            logger.info("Workspace created successfully: {}", response.getId());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error creating workspace", e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to create workspace", e));
        }
    }

    @GetMapping
    public ResponseEntity<?> getUserWorkspaces() {
        try {
            String userId = getCurrentUserId();
            logger.info("Getting workspaces for user: {}", userId);
            
            List<WorkspaceSummaryResponse> response = workspaceService.getUserWorkspaces(userId);
            logger.info("Found {} workspaces for user: {}", response.size(), userId);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting user workspaces", e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to get workspaces", e));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getWorkspace(@PathVariable String id) {
        try {
            String userId = getCurrentUserId();
            logger.info("Getting workspace: {} for user: {}", id, userId);
            
            WorkspaceResponse response = workspaceService.getWorkspace(id, userId);
            logger.info("Workspace retrieved successfully: {}", id);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting workspace: {}", id, e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to get workspace", e));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateWorkspace(@PathVariable String id, @Valid @RequestBody UpdateWorkspaceRequest request) {
        try {
            String userId = getCurrentUserId();
            logger.info("Updating workspace: {} by user: {}", id, userId);
            
            WorkspaceResponse response = workspaceService.updateWorkspace(id, request, userId);
            logger.info("Workspace updated successfully: {}", id);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error updating workspace: {}", id, e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to update workspace", e));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWorkspace(@PathVariable String id) {
        try {
            String userId = getCurrentUserId();
            logger.info("Deleting workspace: {} by user: {}", id, userId);
            
            workspaceService.deleteWorkspace(id, userId);
            logger.info("Workspace deleted successfully: {}", id);
            
            return ResponseEntity.ok(Map.of("message", "Workspace deleted successfully"));
        } catch (Exception e) {
            logger.error("Error deleting workspace: {}", id, e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to delete workspace", e));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchWorkspaces(@RequestParam String q) {
        try {
            String userId = getCurrentUserId();
            logger.info("Searching workspaces with query: '{}' for user: {}", q, userId);
            
            List<WorkspaceSummaryResponse> response = workspaceService.searchWorkspaces(q, userId);
            logger.info("Found {} workspaces matching query: '{}'", response.size(), q);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error searching workspaces with query: '{}'", q, e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to search workspaces", e));
        }
    }

    @PostMapping("/{id}/invite")
    public ResponseEntity<?> inviteUser(@PathVariable String id, @Valid @RequestBody InviteUserRequest request) {
        try {
            String userId = getCurrentUserId();
            logger.info("Inviting user '{}' to workspace: {} by user: {}", request.getUserEmail(), id, userId);
            
            // TODO: Implement user invitation logic
            Map<String, String> response = Map.of(
                "message", "User invitation sent successfully",
                "email", request.getUserEmail()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error inviting user to workspace: {}", id, e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to invite user", e));
        }
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<?> getWorkspaceMembers(@PathVariable String id) {
        try {
            String userId = getCurrentUserId();
            logger.info("Getting members for workspace: {} by user: {}", id, userId);
            
            // TODO: Implement get workspace members logic
            List<WorkspaceMemberResponse> response = List.of();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting workspace members: {}", id, e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to get workspace members", e));
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

