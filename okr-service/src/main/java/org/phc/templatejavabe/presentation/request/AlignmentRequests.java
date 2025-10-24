package org.phc.templatejavabe.presentation.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public class AlignmentRequests {
    public static class CreateAlignmentRequest {
        @JsonProperty("child_objective_id") @NotBlank
        public String childObjectiveId;
    }
}




