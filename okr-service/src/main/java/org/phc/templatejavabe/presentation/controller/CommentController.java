package org.phc.templatejavabe.presentation.controller;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.phc.templatejavabe.domain.model.Comment;
import org.phc.templatejavabe.domain.service.CommentService;
import org.phc.templatejavabe.presentation.request.comment.CreateCommentRequest;
import org.phc.templatejavabe.presentation.response.comment.CommentResponse;
import org.phc.templatejavabe.application.mapper.CommentMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/comments")
public class CommentController {
    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    public List<CommentResponse> list(@RequestParam(required = false) String objectiveId, 
                                     @RequestParam(required = false) String keyResultId) {
        List<Comment> comments;
        
        if (objectiveId != null) {
            comments = commentService.getCommentsByObjective(objectiveId);
        } else if (keyResultId != null) {
            comments = commentService.getCommentsByKeyResult(keyResultId);
        } else {
            return List.of(); // Return empty list if no filter provided
        }
        
        return comments.stream()
            .map(CommentMapper::toResponse)
            .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<CommentResponse> create(@Valid @RequestBody CreateCommentRequest req) {
        Comment comment = CommentMapper.toEntity(req);
        Comment saved = commentService.addComment(comment);
        return ResponseEntity.ok(CommentMapper.toResponse(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, @RequestParam String userId) {
        try {
            commentService.deleteComment(id, userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommentResponse> get(@PathVariable String id) {
        return commentService.findById(id)
            .map(CommentMapper::toResponse)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
