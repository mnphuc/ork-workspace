package org.phc.templatejavabe.presentation.response.comment;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

public record CommentResponse(
    String id,
    @JsonProperty("objective_id") String objectiveId,
    @JsonProperty("key_result_id") String keyResultId,
    String content,
    @JsonProperty("author_id") String authorId,
    @JsonProperty("created_date") Instant createdDate,
    @JsonProperty("last_modified_date") Instant lastModifiedDate
) {}

