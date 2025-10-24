package org.phc.templatejavabe.application.mapper;

import org.phc.templatejavabe.domain.model.Comment;
import org.phc.templatejavabe.presentation.request.comment.CreateCommentRequest;
import org.phc.templatejavabe.presentation.response.comment.CommentResponse;

public class CommentMapper {
    public static Comment toEntity(CreateCommentRequest req) {
        Comment comment = new Comment();
        comment.setObjectiveId(req.objectiveId());
        comment.setKeyResultId(req.keyResultId());
        comment.setContent(req.content());
        comment.setAuthorId(req.authorId());
        return comment;
    }

    public static CommentResponse toResponse(Comment comment) {
        return new CommentResponse(
            comment.getId(),
            comment.getObjectiveId(),
            comment.getKeyResultId(),
            comment.getContent(),
            comment.getAuthorId(),
            comment.getCreatedDate(),
            comment.getLastModifiedDate()
        );
    }
}

