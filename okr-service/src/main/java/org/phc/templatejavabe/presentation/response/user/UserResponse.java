package org.phc.templatejavabe.presentation.response.user;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UserResponse(
    String id,
    String email,
    @JsonProperty("full_name") String fullName,
    @JsonProperty("avatar_url") String avatarUrl,
    String status
) {}




