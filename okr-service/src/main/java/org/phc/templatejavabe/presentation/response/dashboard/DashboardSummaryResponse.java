package org.phc.templatejavabe.presentation.response.dashboard;

import com.fasterxml.jackson.annotation.JsonProperty;

public record DashboardSummaryResponse(
    @JsonProperty("objectives_progress") int objectivesProgress,
    @JsonProperty("metrics_progress") int metricsProgress,
    @JsonProperty("status_counts") StatusCountsResponse statusCounts
) {}




