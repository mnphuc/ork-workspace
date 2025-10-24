package org.phc.templatejavabe.presentation.request.alignment;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public record CreateAlignmentRequest(
    @JsonProperty("child_objective_id") @NotBlank String childObjectiveId
) {}




