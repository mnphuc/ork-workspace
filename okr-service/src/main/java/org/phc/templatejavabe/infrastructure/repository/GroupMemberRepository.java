package org.phc.templatejavabe.infrastructure.repository;

import org.phc.templatejavabe.domain.model.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, String> {
    
    List<GroupMember> findByGroupIdAndStatusOrderByJoinedDateDesc(String groupId, String status);
    
    List<GroupMember> findByGroupIdOrderByJoinedDateDesc(String groupId);
    
    List<GroupMember> findByUserIdAndStatusOrderByJoinedDateDesc(String userId, String status);
    
    Optional<GroupMember> findByGroupIdAndUserId(String groupId, String userId);
    
    @Query("SELECT gm FROM GroupMember gm WHERE gm.groupId = :groupId AND gm.status = 'ACTIVE' ORDER BY gm.joinedDate DESC")
    List<GroupMember> findActiveMembersByGroup(@Param("groupId") String groupId);
    
    @Query("SELECT COUNT(gm) FROM GroupMember gm WHERE gm.groupId = :groupId AND gm.status = 'ACTIVE'")
    long countActiveMembersByGroup(@Param("groupId") String groupId);
    
    @Query("SELECT gm FROM GroupMember gm WHERE gm.userId = :userId AND gm.status = 'ACTIVE' ORDER BY gm.joinedDate DESC")
    List<GroupMember> findActiveMembershipsByUser(@Param("userId") String userId);
    
    @Query("SELECT gm FROM GroupMember gm WHERE gm.groupId = :groupId AND gm.role = :role AND gm.status = 'ACTIVE'")
    List<GroupMember> findActiveMembersByGroupAndRole(@Param("groupId") String groupId, @Param("role") String role);
    
    boolean existsByGroupIdAndUserId(String groupId, String userId);
    
    boolean existsByGroupIdAndUserIdAndStatus(String groupId, String userId, String status);
}


