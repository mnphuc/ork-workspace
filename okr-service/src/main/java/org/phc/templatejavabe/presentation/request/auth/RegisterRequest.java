package org.phc.templatejavabe.presentation.request.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(
    @Email(message = "{validation.email.invalid}") @NotBlank(message = "{validation.email.required}") String email,
    @NotBlank(message = "{validation.password.required}") String password,
    @JsonProperty("full_name") @NotBlank(message = "{validation.fullName.required}") String fullName
) {}




