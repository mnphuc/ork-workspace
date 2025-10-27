package org.phc.templatejavabe.presentation.request.objective;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public record CreateObjectiveRequest(
    @NotBlank String title,
    String description,
    @JsonProperty("owner_id") @NotBlank String ownerId,
    @JsonProperty("team_id") String teamId,
    @JsonProperty("workspace_id") String workspaceId,
    @NotBlank String quarter,
    String status,
    String type,
    java.math.BigDecimal weight,
    String groups,
    String labels,
    String stakeholders,
    @JsonProperty("start_date") String startDate,
    @JsonProperty("end_date") String endDate,
    @JsonProperty("parent_id") String parentId
) {}




