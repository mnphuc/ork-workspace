package org.phc.templatejavabe.presentation.request.workspace;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateWorkspaceRequest {
    @Size(max = 128, message = "Workspace name must not exceed 128 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @JsonProperty("settings")
    private String settings; // JSON string for workspace settings
}



