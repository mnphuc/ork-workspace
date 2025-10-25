package org.phc.templatejavabe.presentation.response.interval;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IntervalResponse {
    private String id;
    private String name;
    private String description;
    
    @JsonProperty("workspace_id")
    private String workspaceId;
    
    @JsonProperty("interval_type")
    private String intervalType;
    
    @JsonProperty("start_date")
    private String startDate;
    
    @JsonProperty("end_date")
    private String endDate;
    
    @JsonProperty("is_active")
    private Boolean isActive;
    
    private String settings;
    private String status;
    
    @JsonProperty("created_date")
    private String createdDate;
    
    @JsonProperty("last_modified_date")
    private String lastModifiedDate;
    
    @JsonProperty("objective_count")
    private int objectiveCount;
    
    @JsonProperty("owner_id")
    private String ownerId;
}

