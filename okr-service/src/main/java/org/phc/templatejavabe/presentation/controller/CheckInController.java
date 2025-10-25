package org.phc.templatejavabe.presentation.controller;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.phc.templatejavabe.domain.model.CheckIn;
import org.phc.templatejavabe.domain.service.CheckInService;
import org.phc.templatejavabe.presentation.request.checkin.CreateCheckInRequest;
import org.phc.templatejavabe.presentation.response.checkin.CheckInResponse;
import org.phc.templatejavabe.application.mapper.CheckInMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/check-ins")
public class CheckInController {
    private final CheckInService checkInService;

    public CheckInController(CheckInService checkInService) {
        this.checkInService = checkInService;
    }

    @GetMapping
    public List<CheckInResponse> list(@RequestParam(required = false) String keyResultId) {
        if (keyResultId != null) {
            return checkInService.list(keyResultId).stream()
                .map(CheckInMapper::toResponse)
                .collect(Collectors.toList());
        }
        return checkInService.getRecentCheckIns(10).stream()
            .map(CheckInMapper::toResponse)
            .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<CheckInResponse> create(@Valid @RequestBody CreateCheckInRequest req) {
        CheckIn checkIn = CheckInMapper.toEntity(req);
        CheckIn saved = checkInService.create(req.keyResultId(), checkIn);
        return ResponseEntity.ok(CheckInMapper.toResponse(saved));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CheckInResponse> update(@PathVariable String id, @Valid @RequestBody Map<String, Object> updateData) {
        try {
            CheckIn existing = checkInService.findById(id)
                .orElse(null);
            
            if (existing == null) {
                return ResponseEntity.notFound().build();
            }

            // Update fields from request
            if (updateData.containsKey("value")) {
                existing.setValue(new BigDecimal(updateData.get("value").toString()));
            }
            if (updateData.containsKey("note")) {
                existing.setNote(updateData.get("note").toString());
            }

            CheckIn saved = checkInService.update(id, existing);
            return ResponseEntity.ok(CheckInMapper.toResponse(saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        try {
            checkInService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/history/{keyResultId}")
    public List<CheckInResponse> getHistory(@PathVariable String keyResultId) {
        return checkInService.getCheckInHistory(keyResultId).stream()
            .map(CheckInMapper::toResponse)
            .collect(Collectors.toList());
    }
}