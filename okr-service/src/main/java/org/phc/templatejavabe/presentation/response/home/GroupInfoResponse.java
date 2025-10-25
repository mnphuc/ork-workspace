package org.phc.templatejavabe.presentation.response.home;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GroupInfoResponse {
    private String id;
    private String name;
    
    @JsonProperty("objectives_count")
    private int objectivesCount;
    
    @JsonProperty("metrics_count")
    private int metricsCount;
    
    @JsonProperty("avg_objectives_progress")
    private int avgObjectivesProgress;
    
    @JsonProperty("avg_metrics_progress")
    private int avgMetricsProgress;
}



