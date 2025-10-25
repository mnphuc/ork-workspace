package org.phc.templatejavabe.infrastructure.repository;

import org.phc.templatejavabe.domain.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupRepository extends JpaRepository<Group, String> {
    
    List<Group> findByWorkspaceIdAndStatusOrderByCreatedDateDesc(String workspaceId, String status);
    
    List<Group> findByWorkspaceIdOrderByCreatedDateDesc(String workspaceId);
    
    Optional<Group> findByIdAndWorkspaceId(String id, String workspaceId);
    
    @Query("SELECT g FROM Group g WHERE g.workspaceId = :workspaceId AND g.status = 'ACTIVE' ORDER BY g.createdDate DESC")
    List<Group> findActiveGroupsByWorkspace(@Param("workspaceId") String workspaceId);
    
    @Query("SELECT COUNT(g) FROM Group g WHERE g.workspaceId = :workspaceId AND g.status = 'ACTIVE'")
    long countActiveGroupsByWorkspace(@Param("workspaceId") String workspaceId);
    
    @Query("SELECT g FROM Group g WHERE g.workspaceId = :workspaceId AND g.name LIKE %:name% ORDER BY g.createdDate DESC")
    List<Group> findByNameContainingAndWorkspaceId(@Param("name") String name, @Param("workspaceId") String workspaceId);
    
    @Query("SELECT g FROM Group g WHERE g.ownerId = :ownerId AND g.status = 'ACTIVE' ORDER BY g.createdDate DESC")
    List<Group> findActiveGroupsByOwner(@Param("ownerId") String ownerId);
    
    boolean existsByNameAndWorkspaceId(String name, String workspaceId);
    
    boolean existsByIdAndWorkspaceId(String id, String workspaceId);
}

