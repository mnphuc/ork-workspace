package org.phc.templatejavabe.presentation.controller;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;
import org.phc.templatejavabe.domain.service.AlignmentService;
import org.phc.templatejavabe.presentation.request.alignment.CreateAlignmentRequest;
import org.phc.templatejavabe.presentation.response.alignment.AlignmentResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/objectives/{parentObjectiveId}/alignments")
public class AlignmentController {
    private final AlignmentService alignmentService;

    public AlignmentController(AlignmentService alignmentService) {
        this.alignmentService = alignmentService;
    }

    @GetMapping
    public List<AlignmentResponse> list(@PathVariable String parentObjectiveId) {
        return alignmentService.listParents(parentObjectiveId).stream().map(a -> new AlignmentResponse(a.getId().getParentObjectiveId(), a.getId().getChildObjectiveId())).collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<AlignmentResponse> align(@PathVariable String parentObjectiveId, @Valid @RequestBody CreateAlignmentRequest req) {
        var saved = alignmentService.align(parentObjectiveId, req.childObjectiveId());
        return ResponseEntity.ok(new AlignmentResponse(saved.getId().getParentObjectiveId(), saved.getId().getChildObjectiveId()));
    }
}


