package org.phc.templatejavabe.presentation.request.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @Email(message = "{validation.email.invalid}") @NotBlank(message = "{validation.email.required}") String email,
    @NotBlank(message = "{validation.password.required}") String password
) {}




