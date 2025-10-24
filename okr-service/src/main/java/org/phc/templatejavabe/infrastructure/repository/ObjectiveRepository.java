package org.phc.templatejavabe.infrastructure.repository;

import java.util.List;
import org.phc.templatejavabe.domain.model.Objective;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ObjectiveRepository extends JpaRepository<Objective, String> {
    List<Objective> findByOwnerIdAndQuarter(String ownerId, String quarter);
    List<Objective> findByTeamIdAndQuarter(String teamId, String quarter);
    List<Objective> findByQuarterOrderByProgressDesc(String quarter);
}



