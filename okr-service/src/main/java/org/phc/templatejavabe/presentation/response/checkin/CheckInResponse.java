package org.phc.templatejavabe.presentation.response.checkin;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.Instant;

public record CheckInResponse(
    String id,
    @JsonProperty("key_result_id") String keyResultId,
    BigDecimal value,
    String note,
    @JsonProperty("created_date") Instant createdDate,
    @JsonProperty("last_modified_date") Instant lastModifiedDate
) {}



