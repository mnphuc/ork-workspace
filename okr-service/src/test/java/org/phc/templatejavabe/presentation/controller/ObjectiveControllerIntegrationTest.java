package org.phc.templatejavabe.presentation.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.phc.templatejavabe.presentation.request.objective.CreateObjectiveRequest;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ObjectiveControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createObjective_ShouldReturnCreatedObjective() throws Exception {
        // Given
        CreateObjectiveRequest request = new CreateObjectiveRequest(
            "Test Objective",
            "This is a test objective",
            "ACTIVE",
            "test-team-id",
            "2025-Q1",
            2025
        );

        // When & Then
        mockMvc.perform(post("/objectives")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Objective"))
                .andExpect(jsonPath("$.description").value("This is a test objective"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.quarter").value("2025-Q1"))
                .andExpect(jsonPath("$.year").value(2025));
    }

    @Test
    void createObjective_ShouldReturnBadRequest_WhenTitleIsBlank() throws Exception {
        // Given
        CreateObjectiveRequest request = new CreateObjectiveRequest(
            "", // Blank title
            "This is a test objective",
            "ACTIVE",
            "test-team-id",
            "2025-Q1",
            2025
        );

        // When & Then
        mockMvc.perform(post("/objectives")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createObjective_ShouldReturnBadRequest_WhenTitleIsTooLong() throws Exception {
        // Given
        String longTitle = "a".repeat(201); // Exceeds 200 character limit
        CreateObjectiveRequest request = new CreateObjectiveRequest(
            longTitle,
            "This is a test objective",
            "ACTIVE",
            "test-team-id",
            "2025-Q1",
            2025
        );

        // When & Then
        mockMvc.perform(post("/objectives")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createObjective_ShouldReturnBadRequest_WhenDescriptionIsTooLong() throws Exception {
        // Given
        String longDescription = "a".repeat(1001); // Exceeds 1000 character limit
        CreateObjectiveRequest request = new CreateObjectiveRequest(
            "Test Objective",
            longDescription,
            "ACTIVE",
            "test-team-id",
            "2025-Q1",
            2025
        );

        // When & Then
        mockMvc.perform(post("/objectives")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createObjective_ShouldReturnBadRequest_WhenStatusIsInvalid() throws Exception {
        // Given
        CreateObjectiveRequest request = new CreateObjectiveRequest(
            "Test Objective",
            "This is a test objective",
            "INVALID_STATUS", // Invalid status
            "test-team-id",
            "2025-Q1",
            2025
        );

        // When & Then
        mockMvc.perform(post("/objectives")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createObjective_ShouldReturnBadRequest_WhenYearIsInvalid() throws Exception {
        // Given
        CreateObjectiveRequest request = new CreateObjectiveRequest(
            "Test Objective",
            "This is a test objective",
            "ACTIVE",
            "test-team-id",
            "2025-Q1",
            1999 // Invalid year (too old)
        );

        // When & Then
        mockMvc.perform(post("/objectives")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getObjectives_ShouldReturnEmptyList_WhenNoObjectives() throws Exception {
        // When & Then
        mockMvc.perform(get("/objectives"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getObjectives_ShouldReturnObjectives_WithFilters() throws Exception {
        // When & Then
        mockMvc.perform(get("/objectives")
                .param("status", "ACTIVE")
                .param("quarter", "2025-Q1")
                .param("teamId", "test-team"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getObjective_ShouldReturnNotFound_WhenObjectiveDoesNotExist() throws Exception {
        // When & Then
        mockMvc.perform(get("/objectives/non-existent-id"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateObjective_ShouldReturnNotFound_WhenObjectiveDoesNotExist() throws Exception {
        // Given
        CreateObjectiveRequest request = new CreateObjectiveRequest(
            "Updated Objective",
            "Updated description",
            "ACTIVE",
            "test-team-id",
            "2025-Q1",
            2025
        );

        // When & Then
        mockMvc.perform(patch("/objectives/non-existent-id")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteObjective_ShouldReturnNotFound_WhenObjectiveDoesNotExist() throws Exception {
        // When & Then
        mockMvc.perform(delete("/objectives/non-existent-id"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getKeyResults_ShouldReturnEmptyList_WhenObjectiveDoesNotExist() throws Exception {
        // When & Then
        mockMvc.perform(get("/objectives/non-existent-id/key-results"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
