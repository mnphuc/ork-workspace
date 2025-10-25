package org.phc.templatejavabe.presentation.request.group;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateGroupRequest {
    @Size(max = 128, message = "Group name must not exceed 128 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @JsonProperty("group_type")
    private String groupType;

    private String settings; // JSON string for group settings
}

