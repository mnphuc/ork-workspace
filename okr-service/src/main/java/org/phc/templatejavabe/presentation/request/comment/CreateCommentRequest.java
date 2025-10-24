package org.phc.templatejavabe.presentation.request.comment;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCommentRequest(
    @JsonProperty("objective_id") String objectiveId,
    @JsonProperty("key_result_id") String keyResultId,
    @NotBlank @Size(max = 2000) String content,
    @JsonProperty("author_id") @NotBlank String authorId
) {}

