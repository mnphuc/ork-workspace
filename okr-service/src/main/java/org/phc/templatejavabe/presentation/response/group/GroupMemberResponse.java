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
public class GroupMemberResponse {
    private String id;
    
    @JsonProperty("user_id")
    private String userId;
    
    @JsonProperty("user_email")
    private String userEmail;
    
    @JsonProperty("full_name")
    private String fullName;
    
    @JsonProperty("avatar_url")
    private String avatarUrl;
    
    private String role;
    private String permissions;
    
    @JsonProperty("joined_date")
    private String joinedDate;
    
    @JsonProperty("last_activity")
    private String lastActivity;
}

