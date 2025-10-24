package org.phc.templatejavabe.application.mapper;

import org.phc.templatejavabe.domain.model.Objective;
import org.phc.templatejavabe.domain.model.ObjectiveStatus;
import org.phc.templatejavabe.domain.model.ObjectiveType;
import org.phc.templatejavabe.presentation.request.objective.CreateObjectiveRequest;
import org.phc.templatejavabe.presentation.request.objective.UpdateObjectiveRequest;
import org.phc.templatejavabe.presentation.response.objective.ObjectiveResponse;

public class ObjectiveMapper {
    public static Objective toEntity(CreateObjectiveRequest req) {
        Objective o = new Objective();
        o.setTitle(req.title());
        o.setDescription(req.description());
        o.setOwnerId(req.ownerId());
        o.setTeamId(req.teamId());
        o.setQuarter(req.quarter());
        
        // Handle status enum conversion
        if (req.status() != null) {
            try {
                o.setStatus(ObjectiveStatus.valueOf(req.status()));
            } catch (IllegalArgumentException e) {
                o.setStatus(ObjectiveStatus.NOT_STARTED);
            }
        } else {
            o.setStatus(ObjectiveStatus.NOT_STARTED);
        }
        
        // Handle type enum conversion
        if (req.type() != null) {
            try {
                o.setType(ObjectiveType.valueOf(req.type()));
            } catch (IllegalArgumentException e) {
                o.setType(ObjectiveType.COMPANY);
            }
        } else {
            o.setType(ObjectiveType.COMPANY);
        }
        
        // Set new fields
        o.setGroups(req.groups());
        o.setLabels(req.labels());
        o.setStakeholders(req.stakeholders());
        
        // Handle date conversion
        if (req.startDate() != null) {
            try {
                o.setStartDate(java.time.LocalDate.parse(req.startDate()));
            } catch (Exception e) {
                // Keep null if invalid date
            }
        }
        if (req.endDate() != null) {
            try {
                o.setEndDate(java.time.LocalDate.parse(req.endDate()));
            } catch (Exception e) {
                // Keep null if invalid date
            }
        }
        
        return o;
    }

    public static void applyUpdate(Objective existing, UpdateObjectiveRequest req) {
        if (req.title() != null) existing.setTitle(req.title());
        if (req.description() != null) existing.setDescription(req.description());
        if (req.ownerId() != null) existing.setOwnerId(req.ownerId());
        if (req.teamId() != null) existing.setTeamId(req.teamId());
        if (req.quarter() != null) existing.setQuarter(req.quarter());
        if (req.status() != null) {
            try {
                existing.setStatus(ObjectiveStatus.valueOf(req.status()));
            } catch (IllegalArgumentException e) {
                // Keep existing status if invalid
            }
        }
    }

    public static ObjectiveResponse toResponse(Objective o) {
        return new ObjectiveResponse(
            o.getId(), 
            o.getTitle(), 
            o.getDescription(), 
            o.getOwnerId(), 
            o.getTeamId(), 
            o.getQuarter(), 
            o.getStatus() != null ? o.getStatus().name() : null,
            o.getProgress(),
            o.getCreatedDate(),
            o.getLastModifiedDate(),
            o.getType() != null ? o.getType().name() : null,
            o.getGroups(),
            o.getLabels(),
            o.getStakeholders(),
            o.getStartDate() != null ? o.getStartDate().toString() : null,
            o.getEndDate() != null ? o.getEndDate().toString() : null
        );
    }
}



