package org.phc.templatejavabe.presentation.controller;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.phc.templatejavabe.domain.model.KeyResult;
import org.phc.templatejavabe.domain.service.KeyResultService;
import org.phc.templatejavabe.presentation.request.keyresult.CreateKeyResultRequest;
import org.phc.templatejavabe.presentation.request.keyresult.UpdateKeyResultRequest;
import org.phc.templatejavabe.presentation.response.keyresult.KeyResultResponse;
import org.phc.templatejavabe.application.mapper.KeyResultMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/key-results")
public class KeyResultController {
    private final KeyResultService keyResultService;

    public KeyResultController(KeyResultService keyResultService) {
        this.keyResultService = keyResultService;
    }

    @GetMapping
    public List<KeyResultResponse> list(@RequestParam(required = false) String objectiveId) {
        if (objectiveId != null) {
            return keyResultService.findByObjectiveId(objectiveId).stream()
                .map(KeyResultMapper::toResponse)
                .collect(Collectors.toList());
        }
        return keyResultService.findAll().stream()
            .map(KeyResultMapper::toResponse)
            .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<KeyResultResponse> get(@PathVariable String id) {
        return keyResultService.findById(id)
            .map(KeyResultMapper::toResponse)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<KeyResultResponse> create(@Valid @RequestBody CreateKeyResultRequest req) {
        KeyResult kr = KeyResultMapper.toEntity(req);
        KeyResult saved = keyResultService.create(kr);
        return ResponseEntity.ok(KeyResultMapper.toResponse(saved));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<KeyResultResponse> update(@PathVariable String id, @Valid @RequestBody UpdateKeyResultRequest req) {
        return keyResultService.findById(id).map(existing -> {
            KeyResultMapper.applyUpdate(existing, req);
            KeyResult saved = keyResultService.update(existing);
            return ResponseEntity.ok(KeyResultMapper.toResponse(saved));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        keyResultService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/objective/{objectiveId}")
    public ResponseEntity<List<KeyResultResponse>> getByObjective(@PathVariable String objectiveId) {
        List<KeyResult> keyResults = keyResultService.findByObjectiveId(objectiveId);
        List<KeyResultResponse> responses = keyResults.stream()
            .map(KeyResultMapper::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/objective/{objectiveId}")
    public ResponseEntity<KeyResultResponse> createForObjective(
        @PathVariable String objectiveId, 
        @Valid @RequestBody CreateKeyResultRequest req) {
        KeyResult kr = KeyResultMapper.toEntity(req);
        kr.setObjectiveId(objectiveId);
        KeyResult saved = keyResultService.create(kr);
        return ResponseEntity.ok(KeyResultMapper.toResponse(saved));
    }

    @GetMapping("/{id}/check-ins")
    public List<Map<String, Object>> getCheckIns(@PathVariable String id) {
        // This would need CheckInService integration
        return List.of(); // Placeholder
    }

    @PostMapping("/{id}/check-ins")
    public ResponseEntity<Map<String, Object>> createCheckIn(@PathVariable String id, @Valid @RequestBody Map<String, Object> checkInData) {
        // This would need CheckInService integration
        return ResponseEntity.ok(Map.of("message", "Check-in created"));
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<KeyResultResponse> duplicate(@PathVariable String id) {
        return keyResultService.findById(id)
            .map(keyResultService::duplicate)
            .map(KeyResultMapper::toResponse)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
}