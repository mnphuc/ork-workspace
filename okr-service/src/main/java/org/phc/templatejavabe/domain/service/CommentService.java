package org.phc.templatejavabe.domain.service;

import java.util.List;
import java.util.Optional;
import org.phc.templatejavabe.domain.model.Comment;
import org.phc.templatejavabe.infrastructure.repository.CommentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommentService {
    private final CommentRepository commentRepository;

    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    public List<Comment> getCommentsByObjective(String objectiveId) {
        return commentRepository.findByObjectiveIdOrderByIdDesc(objectiveId);
    }

    public List<Comment> getCommentsByKeyResult(String keyResultId) {
        return commentRepository.findByKeyResultIdOrderByIdDesc(keyResultId);
    }

    @Transactional
    public Comment addComment(Comment comment) {
        // Validate that either objectiveId or keyResultId is provided, but not both
        if ((comment.getObjectiveId() == null && comment.getKeyResultId() == null) ||
            (comment.getObjectiveId() != null && comment.getKeyResultId() != null)) {
            throw new IllegalArgumentException("Comment must be associated with either an objective or a key result, but not both");
        }

        // Set audit fields
        comment.setCreatedBy(comment.getAuthorId());
        comment.setCreatedDate(java.time.Instant.now());
        
        return commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(String commentId, String userId) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new IllegalArgumentException("Comment không tồn tại"));

        // Only allow owner to delete comment
        if (!comment.getAuthorId().equals(userId)) {
            throw new IllegalArgumentException("Chỉ có thể xóa comment của chính mình");
        }

        commentRepository.deleteById(commentId);
    }

    public Optional<Comment> findById(String id) {
        return commentRepository.findById(id);
    }
}

