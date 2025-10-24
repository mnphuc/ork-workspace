package org.phc.templatejavabe.infrastructure.repository;

import java.util.List;
import org.phc.templatejavabe.domain.model.KeyResult;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KeyResultRepository extends JpaRepository<KeyResult, String> {
    List<KeyResult> findByObjectiveId(String objectiveId);
}




