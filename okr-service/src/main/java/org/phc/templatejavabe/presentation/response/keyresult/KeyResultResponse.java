package org.phc.templatejavabe.presentation.response.keyresult;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.Instant;

public record KeyResultResponse(
    String id,
    @JsonProperty("objective_id") String objectiveId,
    String title,
    @JsonProperty("metric_type") String metricType,
    String unit,
    @JsonProperty("target_value") BigDecimal targetValue,
    @JsonProperty("current_value") BigDecimal currentValue,
    @JsonProperty("created_date") Instant createdDate,
    @JsonProperty("last_modified_date") Instant lastModifiedDate
) {}



