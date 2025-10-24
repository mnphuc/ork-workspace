package org.phc.templatejavabe.application.mapper;

import org.phc.templatejavabe.domain.model.ObjectiveAlignment;
import org.phc.templatejavabe.domain.model.ObjectiveAlignmentId;
import org.phc.templatejavabe.presentation.request.alignment.CreateAlignmentRequest;
import org.phc.templatejavabe.presentation.response.alignment.AlignmentResponse;

public class AlignmentMapper {
    public static ObjectiveAlignment toEntity(String parentObjectiveId, CreateAlignmentRequest req) {
        ObjectiveAlignment a = new ObjectiveAlignment();
        a.setId(new ObjectiveAlignmentId(parentObjectiveId, req.childObjectiveId()));
        return a;
    }

    public static AlignmentResponse toResponse(ObjectiveAlignment a) {
        return new AlignmentResponse(a.getId().getParentObjectiveId(), a.getId().getChildObjectiveId());
    }
}




