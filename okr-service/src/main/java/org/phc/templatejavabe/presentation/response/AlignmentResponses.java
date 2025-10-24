package org.phc.templatejavabe.presentation.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.phc.templatejavabe.domain.model.ObjectiveAlignment;

public class AlignmentResponses {
    public static class AlignmentResponse {
        @JsonProperty("parent_objective_id")
        public String parentObjectiveId;
        @JsonProperty("child_objective_id")
        public String childObjectiveId;

        public static AlignmentResponse from(ObjectiveAlignment a) {
            AlignmentResponse r = new AlignmentResponse();
            r.parentObjectiveId = a.getId().getParentObjectiveId();
            r.childObjectiveId = a.getId().getChildObjectiveId();
            return r;
        }
    }
}




