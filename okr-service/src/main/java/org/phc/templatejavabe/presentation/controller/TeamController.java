package org.phc.templatejavabe.presentation.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.phc.templatejavabe.domain.model.Team;
import org.phc.templatejavabe.domain.service.TeamService;
import org.phc.templatejavabe.application.mapper.TeamMapper;
import org.phc.templatejavabe.presentation.response.team.TeamResponse;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/teams")
public class TeamController {
    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @GetMapping
    public ResponseEntity<List<TeamResponse>> getAllTeams() {
        List<Team> teams = teamService.findAll();
        List<TeamResponse> responses = teams.stream()
            .map(TeamMapper::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamResponse> getTeam(@PathVariable String id) {
        return teamService.findById(id)
            .map(TeamMapper::toResponse)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
