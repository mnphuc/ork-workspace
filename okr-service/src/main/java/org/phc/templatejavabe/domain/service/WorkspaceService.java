package org.phc.templatejavabe.domain.service;

import org.phc.templatejavabe.domain.model.Workspace;
import org.phc.templatejavabe.domain.repository.UserRepository;
import org.phc.templatejavabe.infrastructure.repository.WorkspaceRepository;
import org.phc.templatejavabe.presentation.request.workspace.*;
import org.phc.templatejavabe.presentation.response.workspace.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@SuppressWarnings("unused")
public class WorkspaceService {
    private static final Logger logger = LoggerFactory.getLogger(WorkspaceService.class);
    
    private final WorkspaceRepository workspaceRepository;
    // UserRepository will be used when implementing workspace member checks and member count
    private final UserRepository userRepository;
    private final IdGeneratorService idGeneratorService;

    public WorkspaceService(WorkspaceRepository workspaceRepository, 
                          UserRepository userRepository,
                          IdGeneratorService idGeneratorService) {
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
        this.idGeneratorService = idGeneratorService;
    }

    /**
     * Create a new workspace
     */
    public WorkspaceResponse createWorkspace(CreateWorkspaceRequest request, String ownerId) {
        logger.info("Creating workspace '{}' for user: {}", request.getName(), ownerId);
        
        try {
            // Check if workspace name already exists for this user
            Optional<Workspace> existingWorkspace = workspaceRepository.findByNameAndOwnerId(request.getName(), ownerId);
            if (existingWorkspace.isPresent()) {
                throw new RuntimeException("Workspace with name '" + request.getName() + "' already exists");
            }

            // Create new workspace
            Workspace workspace = new Workspace();
            workspace.setName(request.getName());
            workspace.setDescription(request.getDescription());
            workspace.setOwnerId(ownerId);
            workspace.setStatus(Workspace.WorkspaceStatus.ACTIVE);
            workspace.setSettings(request.getSettings());
            workspace.setCreatedBy(ownerId);
            workspace.setCreatedDate(Instant.now());
            workspace.setLastModifiedBy(ownerId);
            workspace.setLastModifiedDate(Instant.now());

            Workspace savedWorkspace = workspaceRepository.save(workspace);
            logger.info("Workspace created successfully: {}", savedWorkspace.getId());

            return mapToWorkspaceResponse(savedWorkspace);
            
        } catch (Exception e) {
            logger.error("Error creating workspace for user: {}", ownerId, e);
            throw new RuntimeException("Failed to create workspace: " + e.getMessage(), e);
        }
    }

    /**
     * Get workspace by ID
     */
    public WorkspaceResponse getWorkspace(String workspaceId, String userId) {
        logger.info("Getting workspace: {} for user: {}", workspaceId, userId);
        
        try {
            Optional<Workspace> workspace = workspaceRepository.findById(workspaceId);
            if (workspace.isEmpty()) {
                throw new RuntimeException("Workspace not found");
            }

            Workspace ws = workspace.get();
            
            // Check if user has access to this workspace
            if (!ws.getOwnerId().equals(userId)) {
                // TODO: Check if user is a member of the workspace
                throw new RuntimeException("Access denied to workspace");
            }

            return mapToWorkspaceResponse(ws);
            
        } catch (Exception e) {
            logger.error("Error getting workspace: {} for user: {}", workspaceId, userId, e);
            throw new RuntimeException("Failed to get workspace: " + e.getMessage(), e);
        }
    }

    /**
     * Update workspace
     */
    public WorkspaceResponse updateWorkspace(String workspaceId, UpdateWorkspaceRequest request, String userId) {
        logger.info("Updating workspace: {} by user: {}", workspaceId, userId);
        
        try {
            Optional<Workspace> workspaceOpt = workspaceRepository.findById(workspaceId);
            if (workspaceOpt.isEmpty()) {
                throw new RuntimeException("Workspace not found");
            }

            Workspace workspace = workspaceOpt.get();
            
            // Check if user is the owner
            if (!workspace.getOwnerId().equals(userId)) {
                throw new RuntimeException("Only workspace owner can update workspace");
            }

            // Update fields
            if (request.getName() != null && !request.getName().trim().isEmpty()) {
                workspace.setName(request.getName());
            }
            if (request.getDescription() != null) {
                workspace.setDescription(request.getDescription());
            }
            if (request.getSettings() != null) {
                workspace.setSettings(request.getSettings());
            }
            
            workspace.setLastModifiedBy(userId);
            workspace.setLastModifiedDate(Instant.now());

            Workspace savedWorkspace = workspaceRepository.save(workspace);
            logger.info("Workspace updated successfully: {}", savedWorkspace.getId());

            return mapToWorkspaceResponse(savedWorkspace);
            
        } catch (Exception e) {
            logger.error("Error updating workspace: {} by user: {}", workspaceId, userId, e);
            throw new RuntimeException("Failed to update workspace: " + e.getMessage(), e);
        }
    }

    /**
     * Delete workspace
     */
    public void deleteWorkspace(String workspaceId, String userId) {
        logger.info("Deleting workspace: {} by user: {}", workspaceId, userId);
        
        try {
            Optional<Workspace> workspaceOpt = workspaceRepository.findById(workspaceId);
            if (workspaceOpt.isEmpty()) {
                throw new RuntimeException("Workspace not found");
            }

            Workspace workspace = workspaceOpt.get();
            
            // Check if user is the owner
            if (!workspace.getOwnerId().equals(userId)) {
                throw new RuntimeException("Only workspace owner can delete workspace");
            }

            // Soft delete by changing status
            workspace.setStatus(Workspace.WorkspaceStatus.ARCHIVED);
            workspace.setLastModifiedBy(userId);
            workspace.setLastModifiedDate(Instant.now());

            workspaceRepository.save(workspace);
            logger.info("Workspace deleted successfully: {}", workspaceId);
            
        } catch (Exception e) {
            logger.error("Error deleting workspace: {} by user: {}", workspaceId, userId, e);
            throw new RuntimeException("Failed to delete workspace: " + e.getMessage(), e);
        }
    }

    /**
     * Get all workspaces for a user
     */
    public List<WorkspaceSummaryResponse> getUserWorkspaces(String userId) {
        logger.info("Getting workspaces for user: {}", userId);
        
        try {
            List<Workspace> workspaces = workspaceRepository.findByOwnerIdAndStatus(userId, Workspace.WorkspaceStatus.ACTIVE);
            
            List<WorkspaceSummaryResponse> response = workspaces.stream()
                .map(this::mapToWorkspaceSummaryResponse)
                .collect(Collectors.toList());
            
            logger.info("Found {} workspaces for user: {}", response.size(), userId);
            return response;
            
        } catch (Exception e) {
            logger.error("Error getting workspaces for user: {}", userId, e);
            throw new RuntimeException("Failed to get workspaces: " + e.getMessage(), e);
        }
    }

    /**
     * Search workspaces by name
     */
    public List<WorkspaceSummaryResponse> searchWorkspaces(String query, String userId) {
        logger.info("Searching workspaces with query: '{}' for user: {}", query, userId);
        
        try {
            List<Workspace> workspaces = workspaceRepository.findByNameContainingIgnoreCase(query);
            
            // Filter workspaces that user has access to
            List<WorkspaceSummaryResponse> response = workspaces.stream()
                .filter(ws -> ws.getOwnerId().equals(userId)) // Only owned workspaces for now
                .map(this::mapToWorkspaceSummaryResponse)
                .collect(Collectors.toList());
            
            logger.info("Found {} workspaces matching query: '{}'", response.size(), query);
            return response;
            
        } catch (Exception e) {
            logger.error("Error searching workspaces with query: '{}' for user: {}", query, userId, e);
            throw new RuntimeException("Failed to search workspaces: " + e.getMessage(), e);
        }
    }

    private WorkspaceResponse mapToWorkspaceResponse(Workspace workspace) {
        return new WorkspaceResponse(
            workspace.getId(),
            workspace.getName(),
            workspace.getDescription(),
            workspace.getOwnerId(),
            workspace.getStatus().toString(),
            workspace.getSettings(),
            workspace.getCreatedDate() != null ? workspace.getCreatedDate().toString() : null,
            workspace.getLastModifiedDate() != null ? workspace.getLastModifiedDate().toString() : null,
            0, // memberCount - TODO: implement
            0  // objectiveCount - TODO: implement
        );
    }

    private WorkspaceSummaryResponse mapToWorkspaceSummaryResponse(Workspace workspace) {
        return new WorkspaceSummaryResponse(
            workspace.getId(),
            workspace.getName(),
            workspace.getDescription(),
            workspace.getOwnerId(),
            workspace.getStatus().toString(),
            0, // memberCount - TODO: implement
            0, // objectiveCount - TODO: implement
            0, // teamCount - TODO: implement
            workspace.getLastModifiedDate() != null ? workspace.getLastModifiedDate().toString() : null
        );
    }
}


