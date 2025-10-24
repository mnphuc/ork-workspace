package org.phc.templatejavabe.application.mapper;

import org.phc.templatejavabe.domain.model.CheckIn;
import org.phc.templatejavabe.presentation.request.checkin.CreateCheckInRequest;
import org.phc.templatejavabe.presentation.response.checkin.CheckInResponse;

public class CheckInMapper {
    public static CheckIn toEntity(CreateCheckInRequest req) {
        CheckIn c = new CheckIn();
        c.setKeyResultId(req.keyResultId());
        c.setValue(req.value());
        c.setNote(req.note());
        return c;
    }

    public static CheckInResponse toResponse(CheckIn c) {
        return new CheckInResponse(
            c.getId(), 
            c.getKeyResultId(), 
            c.getValue(), 
            c.getNote(),
            c.getCreatedDate(),
            c.getLastModifiedDate()
        );
    }
}



