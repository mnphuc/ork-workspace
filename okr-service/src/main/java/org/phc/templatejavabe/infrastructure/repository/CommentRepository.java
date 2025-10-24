package org.phc.templatejavabe.infrastructure.repository;

import java.util.List;
import org.phc.templatejavabe.domain.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, String> {
    List<Comment> findByObjectiveIdOrderByCreatedDateDesc(String objectiveId);
    List<Comment> findByKeyResultIdOrderByCreatedDateDesc(String keyResultId);
}

