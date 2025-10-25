package org.phc.templatejavabe.application.mapper;

import java.math.BigDecimal;
import org.phc.templatejavabe.domain.model.Objective;
import org.phc.templatejavabe.domain.model.ObjectiveStatus;
import org.phc.templatejavabe.domain.model.ObjectiveType;
import org.phc.templatejavabe.domain.service.KeyResultService;
import org.phc.templatejavabe.domain.service.ObjectiveService;
import org.phc.templatejavabe.presentation.request.objective.CreateObjectiveRequest;
import org.phc.templatejavabe.presentation.request.objective.UpdateObjectiveRequest;
import org.phc.templatejavabe.presentation.response.objective.ObjectiveResponse;
import org.phc.templatejavabe.presentation.response.keyresult.KeyResultResponse;
import org.phc.templatejavabe.application.mapper.KeyResultMapper;
import java.util.List;
import java.util.stream.Collectors;

public class ObjectiveMapper {
    public static Objective toEntity(CreateObjectiveRequest req) {
        Objective o = new Objective();
        o.setTitle(req.title());
        o.setDescription(req.description());
        o.setOwnerId(req.ownerId());
        o.setTeamId(req.teamId());
        o.setWorkspaceId(req.workspaceId());
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
        o.setWeight(req.weight() != null ? req.weight() : BigDecimal.ONE);
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
        if (req.workspaceId() != null) existing.setWorkspaceId(req.workspaceId());
        if (req.quarter() != null) existing.setQuarter(req.quarter());
        if (req.status() != null) {
            try {
                existing.setStatus(ObjectiveStatus.valueOf(req.status()));
            } catch (IllegalArgumentException e) {
                // Keep existing status if invalid
            }
        }
        if (req.weight() != null) existing.setWeight(req.weight());
    }

    public static ObjectiveResponse toResponse(Objective o) {
        return new ObjectiveResponse(
            o.getId(), 
            o.getTitle(), 
            o.getDescription(), 
            o.getOwnerId(), 
            o.getTeamId(), 
            o.getWorkspaceId(),
            o.getQuarter(), 
            o.getStatus() != null ? o.getStatus().name() : null,
            o.getProgress(),
            o.getWeight(),
            o.getCreatedDate(),
            o.getLastModifiedDate(),
            o.getType() != null ? o.getType().name() : null,
            parseGroups(o.getGroups()),
            o.getLabels(),
            o.getStakeholders(),
            o.getStartDate() != null ? o.getStartDate().toString() : null,
            o.getEndDate() != null ? o.getEndDate().toString() : null,
            null, // lastCheckInDate - will be calculated separately
            0, // commentsCount - will be calculated separately
            List.of(), // keyResults - empty for backward compatibility
            List.of() // kpis - empty for backward compatibility
        );
    }

    public static ObjectiveResponse toResponseWithChildren(Objective o, KeyResultService keyResultService, ObjectiveService objectiveService) {
        // Load key results
        List<KeyResultResponse> keyResults = keyResultService.findByObjectiveId(o.getId()).stream()
            .map(KeyResultMapper::toResponse)
            .collect(Collectors.toList());

        // Load KPIs (objectives with type=KPI and parentId=objectiveId)
        List<ObjectiveResponse> kpis = objectiveService.findKPIsByParentId(o.getId()).stream()
            .map(kpi -> toResponse(kpi)) // Use simple toResponse for KPIs to avoid infinite recursion
            .collect(Collectors.toList());

        return new ObjectiveResponse(
            o.getId(), 
            o.getTitle(), 
            o.getDescription(), 
            o.getOwnerId(), 
            o.getTeamId(), 
            o.getWorkspaceId(),
            o.getQuarter(), 
            o.getStatus() != null ? o.getStatus().name() : null,
            o.getProgress(),
            o.getWeight(),
            o.getCreatedDate(),
            o.getLastModifiedDate(),
            o.getType() != null ? o.getType().name() : null,
            parseGroups(o.getGroups()),
            o.getLabels(),
            o.getStakeholders(),
            o.getStartDate() != null ? o.getStartDate().toString() : null,
            o.getEndDate() != null ? o.getEndDate().toString() : null,
            null, // lastCheckInDate - will be calculated separately
            0, // commentsCount - will be calculated separately
            keyResults,
            kpis
        );
    }

    private static java.util.List<String> parseGroups(String groups) {
        if (groups == null || groups.trim().isEmpty()) {
            return java.util.List.of();
        }
        return java.util.Arrays.stream(groups.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .collect(java.util.stream.Collectors.toList());
    }
}



