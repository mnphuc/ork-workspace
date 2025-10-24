package org.phc.templatejavabe.domain.service;

import java.util.List;
import java.util.Optional;
import org.phc.templatejavabe.domain.model.Team;
import org.phc.templatejavabe.infrastructure.repository.TeamRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TeamService {
    private final TeamRepository teamRepository;

    public TeamService(TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
    }

    public List<Team> findAll() {
        return teamRepository.findAll();
    }

    public Optional<Team> findById(String id) {
        return teamRepository.findById(id);
    }

    @Transactional
    public Team create(Team team) {
        return teamRepository.save(team);
    }

    @Transactional
    public Team update(Team team) {
        return teamRepository.save(team);
    }

    @Transactional
    public void deleteById(String id) {
        teamRepository.deleteById(id);
    }
}
