package org.phc.templatejavabe.presentation.controller;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.phc.templatejavabe.domain.model.Objective;
import org.phc.templatejavabe.domain.model.KeyResult;
import org.phc.templatejavabe.domain.service.ObjectiveService;
import org.phc.templatejavabe.domain.service.KeyResultService;
import org.phc.templatejavabe.domain.service.AlignmentService;
import org.phc.templatejavabe.presentation.request.objective.CreateObjectiveRequest;
import org.phc.templatejavabe.presentation.request.objective.UpdateObjectiveRequest;
import org.phc.templatejavabe.presentation.response.objective.ObjectiveResponse;
import org.phc.templatejavabe.presentation.response.keyresult.KeyResultResponse;
import org.phc.templatejavabe.application.mapper.ObjectiveMapper;
import org.phc.templatejavabe.application.mapper.KeyResultMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/objectives")
public class ObjectiveController {
    private final ObjectiveService objectiveService;
    private final KeyResultService keyResultService;
    private final AlignmentService alignmentService;

    public ObjectiveController(ObjectiveService objectiveService, 
                              KeyResultService keyResultService,
                              AlignmentService alignmentService) {
        this.objectiveService = objectiveService;
        this.keyResultService = keyResultService;
        this.alignmentService = alignmentService;
    }

    @GetMapping
    public List<ObjectiveResponse> list(@RequestParam(required = false) String workspaceId,
                                       @RequestParam(required = false) String quarter,
                                       @RequestParam(required = false) String teamId,
                                       @RequestParam(required = false) String ownerId) {
        List<Objective> objectives;
        
        // If workspaceId is provided, filter by workspace
        if (workspaceId != null && !workspaceId.isBlank()) {
            if (quarter != null && !quarter.isBlank()) {
                objectives = objectiveService.findByWorkspaceAndQuarter(workspaceId, quarter);
            } else {
                objectives = objectiveService.findByWorkspace(workspaceId);
            }
        } else if (quarter != null && ownerId != null) {
            objectives = objectiveService.findByOwnerAndQuarter(ownerId, quarter);
        } else if (quarter != null && teamId != null) {
            objectives = objectiveService.findByTeamAndQuarter(teamId, quarter);
        } else {
            objectives = objectiveService.findAll();
        }
        
        return objectives.stream()
            .map(ObjectiveMapper::toResponse)
            .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ObjectiveResponse> get(@PathVariable String id) {
        return objectiveService.findById(id)
            .map(ObjectiveMapper::toResponse)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ObjectiveResponse> create(@Valid @RequestBody CreateObjectiveRequest req) {
        Objective o = ObjectiveMapper.toEntity(req);
        Objective saved = objectiveService.create(o);
        return ResponseEntity.ok(ObjectiveMapper.toResponse(saved));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ObjectiveResponse> update(@PathVariable String id, @Valid @RequestBody UpdateObjectiveRequest req) {
        return objectiveService.findById(id).map(existing -> {
            ObjectiveMapper.applyUpdate(existing, req);
            Objective saved = objectiveService.update(existing);
            return ResponseEntity.ok(ObjectiveMapper.toResponse(saved));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/key-results")
    public List<KeyResultResponse> getKeyResults(@PathVariable String id) {
        return keyResultService.findByObjectiveId(id).stream()
            .map(KeyResultMapper::toResponse)
            .collect(Collectors.toList());
    }

    @PostMapping("/{id}/key-results")
    public ResponseEntity<KeyResultResponse> createKeyResult(@PathVariable String id, @Valid @RequestBody Map<String, Object> keyResultData) {
        // Validate KR limit
        if (!objectiveService.validateKeyResultLimit(id)) {
            return ResponseEntity.badRequest().build();
        }
        
        // Create KeyResult from request data
        KeyResult kr = new KeyResult();
        kr.setObjectiveId(id);
        kr.setTitle(keyResultData.get("title").toString());
        kr.setMetricType(org.phc.templatejavabe.domain.model.MetricType.valueOf(keyResultData.get("metric_type").toString()));
        kr.setUnit(keyResultData.get("unit").toString());
        kr.setTargetValue(new java.math.BigDecimal(keyResultData.get("target_value").toString()));
        
        KeyResult saved = keyResultService.create(kr);
        return ResponseEntity.ok(KeyResultMapper.toResponse(saved));
    }

    @GetMapping("/{id}/progress")
    public Map<String, Object> getProgress(@PathVariable String id) {
        Objective objective = objectiveService.findById(id).orElse(null);
        if (objective == null) {
            return Map.of("error", "Objective not found");
        }
        
        List<KeyResult> keyResults = keyResultService.findByObjectiveId(id);
        
        return Map.of(
            "objective_id", id,
            "overall_progress", objective.getProgress(),
            "status", objective.getStatus(),
            "key_results", keyResults.stream().map(kr -> Map.of(
                "id", kr.getId(),
                "title", kr.getTitle(),
                "current_value", kr.getCurrentValue(),
                "target_value", kr.getTargetValue(),
                "progress", keyResultService.calculateProgressPercentage(kr)
            )).collect(Collectors.toList())
        );
    }

    @GetMapping("/{id}/alignments")
    public List<Map<String, Object>> getAlignments(@PathVariable String id) {
        return alignmentService.getAlignmentTree(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        objectiveService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}


