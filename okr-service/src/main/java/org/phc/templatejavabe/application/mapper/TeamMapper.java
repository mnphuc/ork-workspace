package org.phc.templatejavabe.application.mapper;

import org.phc.templatejavabe.domain.model.Team;
import org.phc.templatejavabe.presentation.response.team.TeamResponse;

public class TeamMapper {
    public static TeamResponse toResponse(Team t) {
        return new TeamResponse(t.getId(), t.getName(), t.getDescription(), 
            "ACTIVE"); // Default status since Team model doesn't have status field
    }
}
