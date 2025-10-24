package org.phc.templatejavabe.presentation.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import org.phc.templatejavabe.domain.model.KeyResult;

public class KeyResultResponses {
    public static class KeyResultResponse {
        public String id;
        @JsonProperty("objective_id")
        public String objectiveId;
        public String title;
        @JsonProperty("metric_type")
        public String metricType;
        public String unit;
        @JsonProperty("target_value")
        public BigDecimal targetValue;
        @JsonProperty("current_value")
        public BigDecimal currentValue;

        public static KeyResultResponse from(KeyResult kr) {
            KeyResultResponse r = new KeyResultResponse();
            r.id = kr.getId();
            r.objectiveId = kr.getObjectiveId();
            r.title = kr.getTitle();
            r.metricType = kr.getMetricType() != null ? kr.getMetricType().name() : null;
            r.unit = kr.getUnit();
            r.targetValue = kr.getTargetValue();
            r.currentValue = kr.getCurrentValue();
            return r;
        }
    }
}



