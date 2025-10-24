package org.phc.templatejavabe.presentation.controller;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.phc.templatejavabe.domain.service.DashboardService;
import org.phc.templatejavabe.presentation.response.dashboard.DashboardSummaryResponse;
import org.phc.templatejavabe.presentation.response.dashboard.StatusCountsResponse;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/test")
    public Map<String, String> test() {
        return Map.of("message", "Dashboard API is working!", "timestamp", java.time.Instant.now().toString());
    }

    @GetMapping("/summary")
    public DashboardSummaryResponse summary(@RequestParam String quarter, @RequestParam(required = false) String teamId) {
        Map<String, Object> summary;
        
        if (teamId != null && !teamId.isBlank()) {
            summary = dashboardService.getTeamSummary(teamId, quarter);
        } else {
            // For now, use a default team or return general summary
            summary = dashboardService.getMyOKRSummary("current_user", quarter);
        }
        
        // Convert to response format
        int objectivesProgress = ((java.math.BigDecimal) summary.get("average_progress")).intValue();
        int metricsProgress = objectivesProgress; // Same for now
        
        Map<String, Long> statusDistribution = (Map<String, Long>) summary.get("status_distribution");
        var statusCounts = new StatusCountsResponse(
            statusDistribution.getOrDefault("not_started", 0L).intValue(),
            statusDistribution.getOrDefault("at_risk", 0L).intValue(),
            statusDistribution.getOrDefault("behind", 0L).intValue(),
            statusDistribution.getOrDefault("on_track", 0L).intValue(),
            statusDistribution.getOrDefault("closed", 0L).intValue(),
            statusDistribution.getOrDefault("abandoned", 0L).intValue()
        );
        
        return new DashboardSummaryResponse(objectivesProgress, metricsProgress, statusCounts);
    }

    @GetMapping("/check-in-trend")
    public Map<String, Object> checkInTrend(@RequestParam(defaultValue = "30") int days) {
        return dashboardService.getCheckInTrend(days);
    }

    @GetMapping("/top-performers")
    public List<Map<String, Object>> topPerformers(@RequestParam String quarter, @RequestParam(defaultValue = "10") int limit) {
        return dashboardService.getTopPerformers(quarter, limit);
    }

    // @GetMapping("/recent-check-ins")
    // public List<Map<String, Object>> recentCheckIns(@RequestParam(defaultValue = "5") int limit) {
    //     // Temporarily return empty list to fix dashboard
    //     return new java.util.ArrayList<>();
    // }
}


