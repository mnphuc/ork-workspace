package org.phc.templatejavabe.presentation.request.workspace;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InviteUserRequest {
    @NotBlank(message = "User email is required")
    @JsonProperty("user_email")
    private String userEmail;

    @JsonProperty("role")
    private String role = "MEMBER"; // OWNER, ADMIN, MEMBER, VIEWER
}



