package org.phc.templatejavabe.infrastructure.repository;

import java.util.List;
import org.phc.templatejavabe.domain.model.Threshold;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ThresholdRepository extends JpaRepository<Threshold, String> {
    List<Threshold> findByObjectiveId(String objectiveId);
    void deleteByObjectiveId(String objectiveId);
}
