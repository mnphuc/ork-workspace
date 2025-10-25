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
public class StatusDistributionResponse {
    @JsonProperty("not_started")
    private int notStarted;
    
    @JsonProperty("at_risk")
    private int atRisk;
    
    private int behind;
    
    @JsonProperty("on_track")
    private int onTrack;
    
    private int closed;
    
    private int abandoned;
}



