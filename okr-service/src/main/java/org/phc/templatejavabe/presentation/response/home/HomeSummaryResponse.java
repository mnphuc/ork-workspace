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
public class HomeSummaryResponse {
    @JsonProperty("personal_progress")
    private int personalProgress;
    
    @JsonProperty("metrics_progress")
    private int metricsProgress;
    
    @JsonProperty("last_week_change")
    private int lastWeekChange;
    
    @JsonProperty("status_distribution")
    private StatusDistributionResponse statusDistribution;
}



