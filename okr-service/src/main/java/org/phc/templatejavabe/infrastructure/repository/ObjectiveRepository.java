package org.phc.templatejavabe.infrastructure.repository;

import java.util.List;
import org.phc.templatejavabe.domain.model.Objective;
import org.phc.templatejavabe.domain.model.ObjectiveType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ObjectiveRepository extends JpaRepository<Objective, String> {
    List<Objective> findByOwnerIdAndQuarter(String ownerId, String quarter);
    List<Objective> findByTeamIdAndQuarter(String teamId, String quarter);
    List<Objective> findByWorkspaceId(String workspaceId);
    List<Objective> findByWorkspaceIdAndQuarter(String workspaceId, String quarter);
    List<Objective> findByQuarterOrderByProgressDesc(String quarter);
    List<Objective> findByParentIdAndType(String parentId, ObjectiveType type);
}



