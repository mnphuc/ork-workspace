package org.phc.templatejavabe.presentation.response.objective;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record ObjectiveResponse(
    String id,
    String title,
    String description,
    @JsonProperty("owner_id") String ownerId,
    @JsonProperty("team_id") String teamId,
    @JsonProperty("workspace_id") String workspaceId,
    String quarter,
    String status,
    BigDecimal progress,
    BigDecimal weight,
    @JsonProperty("created_date") Instant createdDate,
    @JsonProperty("last_modified_date") Instant lastModifiedDate,
    String type,
    List<String> groups,
    String labels,
    String stakeholders,
    @JsonProperty("start_date") String startDate,
    @JsonProperty("end_date") String endDate,
    @JsonProperty("last_check_in_date") Instant lastCheckInDate,
    @JsonProperty("comments_count") Integer commentsCount
) {}



