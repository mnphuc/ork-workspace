package org.phc.templatejavabe.domain.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.phc.templatejavabe.domain.model.CheckIn;
import org.phc.templatejavabe.domain.model.Objective;
import org.phc.templatejavabe.domain.model.ObjectiveStatus;
import org.phc.templatejavabe.infrastructure.repository.CheckInRepository;
import org.phc.templatejavabe.infrastructure.repository.ObjectiveRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {
    private final ObjectiveRepository objectiveRepository;
    private final CheckInRepository checkInRepository;

    public DashboardService(ObjectiveRepository objectiveRepository, CheckInRepository checkInRepository) {
        this.objectiveRepository = objectiveRepository;
        this.checkInRepository = checkInRepository;
    }

    /**
     * Get team summary for dashboard
     */
    public Map<String, Object> getTeamSummary(String teamId, String quarter) {
        List<Objective> objectives = objectiveRepository.findByTeamIdAndQuarter(teamId, quarter);
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("total_objectives", objectives.size());
        
        if (!objectives.isEmpty()) {
            BigDecimal avgProgress = objectives.stream()
                .map(Objective::getProgress)
                .filter(progress -> progress != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(objectives.size()), 2, BigDecimal.ROUND_HALF_UP);
            summary.put("average_progress", avgProgress);
        } else {
            summary.put("average_progress", BigDecimal.ZERO);
        }

        // Status distribution
        Map<ObjectiveStatus, Long> statusCounts = objectives.stream()
            .filter(obj -> obj.getStatus() != null)
            .collect(Collectors.groupingBy(Objective::getStatus, Collectors.counting()));
        
        Map<String, Long> statusDistribution = new HashMap<>();
        for (ObjectiveStatus status : ObjectiveStatus.values()) {
            statusDistribution.put(status.name().toLowerCase(), statusCounts.getOrDefault(status, 0L));
        }
        summary.put("status_distribution", statusDistribution);

        return summary;
    }

    /**
     * Get personal OKR summary
     */
    public Map<String, Object> getMyOKRSummary(String userId, String quarter) {
        List<Objective> objectives = objectiveRepository.findByOwnerIdAndQuarter(userId, quarter);
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("total_objectives", objectives.size());
        
        if (!objectives.isEmpty()) {
            BigDecimal avgProgress = objectives.stream()
                .map(Objective::getProgress)
                .filter(progress -> progress != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(objectives.size()), 2, BigDecimal.ROUND_HALF_UP);
            summary.put("average_progress", avgProgress);
        } else {
            summary.put("average_progress", BigDecimal.ZERO);
        }

        // Count objectives by status
        Map<ObjectiveStatus, Long> statusCounts = objectives.stream()
            .filter(obj -> obj.getStatus() != null)
            .collect(Collectors.groupingBy(Objective::getStatus, Collectors.counting()));
        
        Map<String, Long> statusDistribution = new HashMap<>();
        for (ObjectiveStatus status : ObjectiveStatus.values()) {
            statusDistribution.put(status.name().toLowerCase(), statusCounts.getOrDefault(status, 0L));
        }
        summary.put("status_distribution", statusDistribution);

        return summary;
    }

    /**
     * Get check-in trend data for charts
     */
    public Map<String, Object> getCheckInTrend(int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);
        
        // This would need a custom query to group check-ins by date
        // Get actual check-in data from database
        Map<String, Object> trend = new HashMap<>();
        trend.put("period_days", days);
        trend.put("start_date", startDate.format(DateTimeFormatter.ISO_LOCAL_DATE));
        trend.put("end_date", endDate.format(DateTimeFormatter.ISO_LOCAL_DATE));
        trend.put("total_check_ins", checkInRepository.count());
        
        return trend;
    }

    /**
     * Get top performing objectives
     */
    public List<Map<String, Object>> getTopPerformers(String quarter, int limit) {
        List<Objective> objectives = objectiveRepository.findByQuarterOrderByProgressDesc(quarter);
        
        return objectives.stream()
            .limit(limit)
            .map(obj -> {
                Map<String, Object> performer = new HashMap<>();
                performer.put("id", obj.getId());
                performer.put("title", obj.getTitle());
                performer.put("progress", obj.getProgress());
                performer.put("status", obj.getStatus());
                performer.put("owner_id", obj.getOwnerId());
                performer.put("team_id", obj.getTeamId());
                return performer;
            })
            .collect(Collectors.toList());
    }

    /**
     * Get recent check-ins for dashboard
     */
    public List<Map<String, Object>> getRecentCheckIns(int limit) {
        try {
            List<CheckIn> recentCheckIns = checkInRepository.findAll();
            
            return recentCheckIns.stream()
                .sorted((a, b) -> {
                    if (a.getCreatedDate() == null && b.getCreatedDate() == null) return 0;
                    if (a.getCreatedDate() == null) return 1;
                    if (b.getCreatedDate() == null) return -1;
                    return b.getCreatedDate().compareTo(a.getCreatedDate());
                })
                .limit(limit)
                .map(checkIn -> {
                    Map<String, Object> recent = new HashMap<>();
                    recent.put("id", checkIn.getId());
                    recent.put("key_result_id", checkIn.getKeyResultId());
                    recent.put("value", checkIn.getValue());
                    recent.put("note", checkIn.getNote());
                    recent.put("created_date", checkIn.getCreatedDate());
                    recent.put("created_by", checkIn.getCreatedBy());
                    return recent;
                })
                .collect(Collectors.toList());
        } catch (Exception e) {
            // Log error and return empty list
            System.err.println("Error getting recent check-ins: " + e.getMessage());
            e.printStackTrace();
            return new java.util.ArrayList<>();
        }
    }
}

