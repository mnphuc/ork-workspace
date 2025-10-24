package org.phc.templatejavabe.presentation.response.alignment;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AlignmentResponse(
    @JsonProperty("parent_objective_id") String parentObjectiveId,
    @JsonProperty("child_objective_id") String childObjectiveId
) {}




