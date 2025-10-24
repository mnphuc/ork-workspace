package org.phc.templatejavabe.infrastructure.repository;

import java.util.List;
import org.phc.templatejavabe.domain.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, String> {
    List<Comment> findByObjectiveIdOrderByIdDesc(String objectiveId);
    List<Comment> findByKeyResultIdOrderByIdDesc(String keyResultId);
}

