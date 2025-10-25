package org.phc.templatejavabe.presentation.response.group;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GroupResponse {
    private String id;
    private String name;
    private String description;
    
    @JsonProperty("workspace_id")
    private String workspaceId;
    
    @JsonProperty("group_type")
    private String groupType;
    
    private String settings;
    private String status;
    
    @JsonProperty("created_date")
    private String createdDate;
    
    @JsonProperty("last_modified_date")
    private String lastModifiedDate;
    
    @JsonProperty("member_count")
    private int memberCount;
    
    @JsonProperty("objective_count")
    private int objectiveCount;
    
    @JsonProperty("owner_id")
    private String ownerId;
}

