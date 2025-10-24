package org.phc.templatejavabe.infrastructure.repository;

import java.util.List;
import org.phc.templatejavabe.domain.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<Team, String> {
    List<Team> findByManagerId(String managerId);
}

