package org.phc.templatejavabe.presentation.request.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public record RefreshRequest(
    @JsonProperty("refresh_token") @NotBlank String refreshToken
) {}




