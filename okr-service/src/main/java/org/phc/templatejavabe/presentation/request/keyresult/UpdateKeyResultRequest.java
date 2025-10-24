package org.phc.templatejavabe.presentation.request.keyresult;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

public record UpdateKeyResultRequest(
    @Size(max = 255) String title,
    @JsonProperty("metric_type") String metricType,
    @Size(max = 50) String unit,
    @JsonProperty("target_value") @DecimalMin("0.01") java.math.BigDecimal targetValue,
    @JsonProperty("current_value") @DecimalMin("0") java.math.BigDecimal currentValue
) {}