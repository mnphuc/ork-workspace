package org.phc.templatejavabe.presentation.request.keyresult;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

public record CreateKeyResultRequest(
    @JsonProperty("objective_id") @NotBlank String objectiveId,
    @NotBlank @Size(max = 255) String title,
    @JsonProperty("metric_type") @NotBlank String metricType,
    @Size(max = 50) String unit,
    @JsonProperty("target_value") @NotNull @DecimalMin("0") java.math.BigDecimal targetValue,
    @JsonProperty("current_value") @NotNull @DecimalMin("0") java.math.BigDecimal currentValue
) {}