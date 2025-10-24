package org.phc.templatejavabe.presentation.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.phc.templatejavabe.domain.model.Objective;
import org.phc.templatejavabe.domain.model.ObjectiveStatus;
import org.phc.templatejavabe.domain.service.ObjectiveService;
import org.phc.templatejavabe.domain.service.KeyResultService;
import org.phc.templatejavabe.domain.service.AlignmentService;
import org.phc.templatejavabe.presentation.request.objective.CreateObjectiveRequest;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ObjectiveController.class)
class ObjectiveControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ObjectiveService objectiveService;

    @MockBean
    private KeyResultService keyResultService;

    @MockBean
    private AlignmentService alignmentService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGetObjectives_ReturnsListOfObjectives() throws Exception {
        // Given
        Objective objective = new Objective();
        objective.setId("test-id");
        objective.setTitle("Test Objective");
        objective.setDescription("Test Description");
        objective.setStatus(ObjectiveStatus.ON_TRACK);
        objective.setProgress(new BigDecimal("75"));

        List<Objective> objectives = Arrays.asList(objective);
        when(objectiveService.findAll()).thenReturn(objectives);

        // When & Then
        mockMvc.perform(get("/objectives"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value("test-id"))
                .andExpect(jsonPath("$[0].title").value("Test Objective"))
                .andExpect(jsonPath("$[0].status").value("ON_TRACK"))
                .andExpect(jsonPath("$[0].progress").value(75));
    }

    @Test
    void testGetObjective_ReturnsObjectiveWhenFound() throws Exception {
        // Given
        Objective objective = new Objective();
        objective.setId("test-id");
        objective.setTitle("Test Objective");
        objective.setStatus(ObjectiveStatus.ON_TRACK);
        objective.setProgress(new BigDecimal("75"));

        when(objectiveService.findById("test-id")).thenReturn(Optional.of(objective));

        // When & Then
        mockMvc.perform(get("/objectives/test-id"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("test-id"))
                .andExpect(jsonPath("$.title").value("Test Objective"))
                .andExpect(jsonPath("$.status").value("ON_TRACK"))
                .andExpect(jsonPath("$.progress").value(75));
    }

    @Test
    void testGetObjective_ReturnsNotFoundWhenNotExists() throws Exception {
        // Given
        when(objectiveService.findById("non-existent")).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/objectives/non-existent"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testCreateObjective_ReturnsCreatedObjective() throws Exception {
        // Given
        CreateObjectiveRequest request = new CreateObjectiveRequest(
            "New Objective",
            "New Description", 
            "owner-1",
            "team-1",
            "2025-Q1",
            "NOT_STARTED"
        );

        Objective createdObjective = new Objective();
        createdObjective.setId("new-id");
        createdObjective.setTitle("New Objective");
        createdObjective.setDescription("New Description");
        createdObjective.setStatus(ObjectiveStatus.NOT_STARTED);
        createdObjective.setProgress(BigDecimal.ZERO);

        when(objectiveService.create(any(Objective.class))).thenReturn(createdObjective);

        // When & Then
        mockMvc.perform(post("/objectives")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("new-id"))
                .andExpect(jsonPath("$.title").value("New Objective"))
                .andExpect(jsonPath("$.status").value("NOT_STARTED"))
                .andExpect(jsonPath("$.progress").value(0));
    }

    @Test
    void testDeleteObjective_ReturnsNoContent() throws Exception {
        // Given
        when(objectiveService.findById("test-id")).thenReturn(Optional.of(new Objective()));

        // When & Then
        mockMvc.perform(delete("/objectives/test-id"))
                .andExpect(status().isNoContent());
    }

    @Test
    void testGetObjectivesWithFilters_ReturnsFilteredResults() throws Exception {
        // Given
        Objective objective = new Objective();
        objective.setId("test-id");
        objective.setTitle("Test Objective");
        objective.setOwnerId("owner-1");
        objective.setQuarter("2025-Q1");

        List<Objective> objectives = Arrays.asList(objective);
        when(objectiveService.findByOwnerAndQuarter("owner-1", "2025-Q1")).thenReturn(objectives);

        // When & Then
        mockMvc.perform(get("/objectives")
                .param("ownerId", "owner-1")
                .param("quarter", "2025-Q1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value("test-id"));
    }
}

