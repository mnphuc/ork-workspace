package org.phc.templatejavabe.presentation.request.objective;

import com.fasterxml.jackson.annotation.JsonProperty;

public record MoveObjectiveRequest(
    @JsonProperty("team_id") String teamId,
    @JsonProperty("workspace_id") String workspaceId
) {}
