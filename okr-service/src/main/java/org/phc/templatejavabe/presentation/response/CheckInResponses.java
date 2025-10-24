package org.phc.templatejavabe.presentation.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import org.phc.templatejavabe.domain.model.CheckIn;

public class CheckInResponses {
    public static class CheckInResponse {
        public String id;
        @JsonProperty("key_result_id")
        public String keyResultId;
        public BigDecimal value;
        public String note;

        public static CheckInResponse from(CheckIn c) {
            CheckInResponse r = new CheckInResponse();
            r.id = c.getId();
            r.keyResultId = c.getKeyResultId();
            r.value = c.getValue();
            r.note = c.getNote();
            return r;
        }
    }
}




