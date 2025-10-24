package org.phc.templatejavabe.presentation.request.objective;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UpdateObjectiveRequest(
    String title,
    String description,
    @JsonProperty("owner_id") String ownerId,
    @JsonProperty("team_id") String teamId,
    @JsonProperty("workspace_id") String workspaceId,
    String quarter,
    String status,
    java.math.BigDecimal weight
) {}




