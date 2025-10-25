package org.phc.templatejavabe.infrastructure.repository;

import org.phc.templatejavabe.domain.model.Interval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface IntervalRepository extends JpaRepository<Interval, String> {
    
    List<Interval> findByWorkspaceIdAndStatusOrderByStartDateDesc(String workspaceId, String status);
    
    List<Interval> findByWorkspaceIdOrderByStartDateDesc(String workspaceId);
    
    Optional<Interval> findByIdAndWorkspaceId(String id, String workspaceId);
    
    @Query("SELECT i FROM Interval i WHERE i.workspaceId = :workspaceId AND i.isActive = true ORDER BY i.startDate DESC")
    List<Interval> findActiveIntervalsByWorkspace(@Param("workspaceId") String workspaceId);
    
    @Query("SELECT i FROM Interval i WHERE i.workspaceId = :workspaceId AND i.status = 'ACTIVE' ORDER BY i.startDate DESC")
    List<Interval> findActiveIntervalsByWorkspaceStatus(@Param("workspaceId") String workspaceId);
    
    @Query("SELECT COUNT(i) FROM Interval i WHERE i.workspaceId = :workspaceId AND i.isActive = true")
    long countActiveIntervalsByWorkspace(@Param("workspaceId") String workspaceId);
    
    @Query("SELECT i FROM Interval i WHERE i.workspaceId = :workspaceId AND i.intervalType = :intervalType ORDER BY i.startDate DESC")
    List<Interval> findByWorkspaceIdAndIntervalType(@Param("workspaceId") String workspaceId, @Param("intervalType") String intervalType);
    
    @Query("SELECT i FROM Interval i WHERE i.workspaceId = :workspaceId AND :date BETWEEN i.startDate AND i.endDate ORDER BY i.startDate DESC")
    List<Interval> findIntervalsContainingDate(@Param("workspaceId") String workspaceId, @Param("date") LocalDate date);
    
    @Query("SELECT i FROM Interval i WHERE i.workspaceId = :workspaceId AND i.name LIKE %:name% ORDER BY i.startDate DESC")
    List<Interval> findByNameContainingAndWorkspaceId(@Param("name") String name, @Param("workspaceId") String workspaceId);
    
    @Query("SELECT i FROM Interval i WHERE i.ownerId = :ownerId AND i.status = 'ACTIVE' ORDER BY i.startDate DESC")
    List<Interval> findActiveIntervalsByOwner(@Param("ownerId") String ownerId);
    
    boolean existsByNameAndWorkspaceId(String name, String workspaceId);
    
    boolean existsByIdAndWorkspaceId(String id, String workspaceId);
    
    @Query("SELECT CASE WHEN COUNT(i) > 0 THEN true ELSE false END FROM Interval i WHERE i.workspaceId = :workspaceId AND i.isActive = true")
    boolean hasActiveIntervalInWorkspace(@Param("workspaceId") String workspaceId);
}

