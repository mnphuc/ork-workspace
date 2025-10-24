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
public class WorkspaceMemberResponse {
    private String id;
    
    @JsonProperty("workspace_id")
    private String workspaceId;
    
    @JsonProperty("user_id")
    private String userId;
    
    @JsonProperty("user_email")
    private String userEmail;
    
    @JsonProperty("user_name")
    private String userName;
    
    private String role;
    private String status;
    
    @JsonProperty("joined_date")
    private String joinedDate;
}

