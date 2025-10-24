package org.phc.templatejavabe.presentation.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class CheckInRequests {
    public static class CreateCheckInRequest {
        @JsonProperty("value") @NotNull
        public BigDecimal value;
        public String note;
    }
}




