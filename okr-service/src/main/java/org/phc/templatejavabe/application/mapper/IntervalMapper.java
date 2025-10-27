package org.phc.templatejavabe.application.mapper;

import org.phc.templatejavabe.domain.model.Interval;
import org.phc.templatejavabe.presentation.response.interval.IntervalResponse;
import org.springframework.stereotype.Component;

@Component
public class IntervalMapper {

    public static IntervalResponse toResponse(Interval interval) {
        if (interval == null) {
            return null;
        }

        IntervalResponse response = new IntervalResponse();
        response.setId(interval.getId());
        response.setName(interval.getName());
        response.setDescription(interval.getDescription());
        response.setWorkspaceId(interval.getWorkspaceId());
        response.setIntervalType(interval.getIntervalType());
        response.setStartDate(interval.getStartDate() != null ? interval.getStartDate().toString() : null);
        response.setEndDate(interval.getEndDate() != null ? interval.getEndDate().toString() : null);
        response.setIsActive(interval.getIsActive());
        response.setSettings(interval.getSettings());
        response.setStatus(interval.getStatus());
        response.setCreatedDate(interval.getCreatedDate() != null ? interval.getCreatedDate().toString() : null);
        response.setLastModifiedDate(interval.getLastModifiedDate() != null ? interval.getLastModifiedDate().toString() : null);
        response.setObjectiveCount(0); // No direct relationship - would need business logic to calculate
        response.setOwnerId(interval.getOwnerId());

        return response;
    }
}

