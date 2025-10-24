package org.phc.templatejavabe.infrastructure.repository;

import java.util.Optional;
import org.phc.templatejavabe.domain.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, String> {
    Optional<Role> findByName(String name);
}

