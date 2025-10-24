package org.phc.templatejavabe.infrastructure.repository;

import java.util.List;
import org.phc.templatejavabe.domain.model.ObjectiveAlignment;
import org.phc.templatejavabe.domain.model.ObjectiveAlignmentId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ObjectiveAlignmentRepository extends JpaRepository<ObjectiveAlignment, ObjectiveAlignmentId> {
    List<ObjectiveAlignment> findByIdParentObjectiveId(String parentObjectiveId);
    List<ObjectiveAlignment> findByIdChildObjectiveId(String childObjectiveId);
}



