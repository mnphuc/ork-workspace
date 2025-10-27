package org.phc.templatejavabe.presentation.controller;

import jakarta.validation.Valid;
import org.phc.templatejavabe.domain.service.GroupService;
import org.phc.templatejavabe.presentation.request.group.*;
import org.phc.templatejavabe.presentation.response.group.*;
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
@RequestMapping("/groups")
public class GroupController {

    private static final Logger logger = LoggerFactory.getLogger(GroupController.class);

    @Autowired
    private GroupService groupService;

    @PostMapping
    public ResponseEntity<?> createGroup(@Valid @RequestBody CreateGroupRequest request) {
        try {
            String userId = getCurrentUserId();
            logger.info("Creating group '{}' for workspace: {} by user: {}", request.getName(), request.getWorkspaceId(), userId);
            
            GroupResponse response = groupService.createGroup(request, userId);
            logger.info("Group created successfully: {}", response.getId());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error creating group", e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to create group", e));
        }
    }

    @GetMapping
    public ResponseEntity<?> getGroups(@RequestParam(required = false) String workspaceId) {
        try {
            String userId = getCurrentUserId();
            logger.info("Getting groups for workspace: {} by user: {}", workspaceId, userId);
            
            List<GroupResponse> response = groupService.getGroups(workspaceId, userId);
            logger.info("Found {} groups", response.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting groups", e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to get groups", e));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getGroup(@PathVariable String id) {
        try {
            String userId = getCurrentUserId();
            logger.info("Getting group: {} by user: {}", id, userId);
            
            GroupResponse response = groupService.getGroup(id, userId);
            logger.info("Group retrieved successfully: {}", id);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting group: {}", id, e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to get group", e));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateGroup(@PathVariable String id, @Valid @RequestBody UpdateGroupRequest request) {
        try {
            String userId = getCurrentUserId();
            logger.info("Updating group: {} by user: {}", id, userId);
            
            GroupResponse response = groupService.updateGroup(id, request, userId);
            logger.info("Group updated successfully: {}", id);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error updating group: {}", id, e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to update group", e));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGroup(@PathVariable String id) {
        try {
            String userId = getCurrentUserId();
            logger.info("Deleting group: {} by user: {}", id, userId);
            
            groupService.deleteGroup(id, userId);
            logger.info("Group deleted successfully: {}", id);
            
            return ResponseEntity.ok(Map.of("message", "Group deleted successfully"));
        } catch (Exception e) {
            logger.error("Error deleting group: {}", id, e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to delete group", e));
        }
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<?> addMember(@PathVariable String id, @Valid @RequestBody AddMemberRequest request) {
        try {
            String userId = getCurrentUserId();
            logger.info("Adding member '{}' to group: {} by user: {}", request.getUserEmail(), id, userId);
            
            GroupMemberResponse response = groupService.addMember(id, request, userId);
            logger.info("Member added successfully to group: {}", id);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error adding member to group: {}", id, e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to add member", e));
        }
    }

    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<?> removeMember(@PathVariable String id, @PathVariable String memberId) {
        try {
            String userId = getCurrentUserId();
            logger.info("Removing member: {} from group: {} by user: {}", memberId, id, userId);
            
            groupService.removeMember(id, memberId, userId);
            logger.info("Member removed successfully from group: {}", id);
            
            return ResponseEntity.ok(Map.of("message", "Member removed successfully"));
        } catch (Exception e) {
            logger.error("Error removing member from group: {}", id, e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to remove member", e));
        }
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<?> getGroupMembers(@PathVariable String id) {
        try {
            String userId = getCurrentUserId();
            logger.info("Getting members for group: {} by user: {}", id, userId);
            
            List<GroupMemberResponse> response = groupService.getGroupMembers(id, userId);
            logger.info("Found {} members for group: {}", response.size(), id);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting group members: {}", id, e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to get group members", e));
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


