package org.phc.templatejavabe.presentation.request.checkin;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

public record CreateCheckInRequest(
    @JsonProperty("key_result_id") @NotBlank String keyResultId,
    @NotNull @DecimalMin("0") java.math.BigDecimal value,
    @Size(max = 1000) String note
) {}