package org.phc.templatejavabe.presentation.response.workspace;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceSummaryResponse {
    private String id;
    private String name;
    private String description;
    
    @JsonProperty("owner_id")
    private String ownerId;
    
    private String status;
    
    @JsonProperty("member_count")
    private int memberCount;
    
    @JsonProperty("objective_count")
    private int objectiveCount;
    
    @JsonProperty("team_count")
    private int teamCount;
    
    @JsonProperty("last_activity")
    private String lastActivity;
}

