package org.phc.templatejavabe.infrastructure.repository;

import org.phc.templatejavabe.domain.model.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WorkspaceRepository extends JpaRepository<Workspace, String> {
    
    /**
     * Find workspaces owned by a specific user
     */
    List<Workspace> findByOwnerId(String ownerId);
    
    /**
     * Find workspaces by name (case insensitive)
     */
    List<Workspace> findByNameIgnoreCase(String name);
    
    /**
     * Find workspaces by status
     */
    List<Workspace> findByStatus(Workspace.WorkspaceStatus status);
    
    /**
     * Find active workspaces owned by a user
     */
    List<Workspace> findByOwnerIdAndStatus(String ownerId, Workspace.WorkspaceStatus status);
    
    /**
     * Find workspace by name and owner (for uniqueness check)
     */
    Optional<Workspace> findByNameAndOwnerId(String name, String ownerId);
    
    /**
     * Find workspaces where user is a member (through workspace_members table)
     */
    @Query("SELECT w FROM Workspace w JOIN WorkspaceMember wm ON w.id = wm.workspaceId WHERE wm.userId = :userId AND w.status = 'ACTIVE'")
    List<Workspace> findWorkspacesByUserId(@Param("userId") String userId);
    
    /**
     * Count workspaces owned by a user
     */
    long countByOwnerId(String ownerId);
    
    /**
     * Find workspaces by partial name match
     */
    @Query("SELECT w FROM Workspace w WHERE LOWER(w.name) LIKE LOWER(CONCAT('%', :name, '%')) AND w.status = 'ACTIVE'")
    List<Workspace> findByNameContainingIgnoreCase(@Param("name") String name);
}



