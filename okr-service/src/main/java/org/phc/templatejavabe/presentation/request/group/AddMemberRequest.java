package org.phc.templatejavabe.presentation.request.group;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AddMemberRequest {
    @NotBlank(message = "User email is required")
    @Email(message = "Invalid email format")
    @JsonProperty("user_email")
    private String userEmail;

    @JsonProperty("role")
    private String role = "MEMBER"; // ADMIN, MEMBER, VIEWER

    @JsonProperty("permissions")
    private String permissions; // JSON string for specific permissions
}

