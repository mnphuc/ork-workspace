package org.phc.templatejavabe.domain.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.phc.templatejavabe.domain.model.Objective;
import org.phc.templatejavabe.domain.model.ObjectiveStatus;
import org.phc.templatejavabe.domain.model.KeyResult;
import org.phc.templatejavabe.infrastructure.repository.ObjectiveRepository;
import org.phc.templatejavabe.infrastructure.repository.KeyResultRepository;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ObjectiveServiceTest {

    @Mock
    private ObjectiveRepository objectiveRepository;

    @Mock
    private KeyResultRepository keyResultRepository;

    @InjectMocks
    private ObjectiveService objectiveService;

    private Objective testObjective;
    private List<KeyResult> testKeyResults;

    @BeforeEach
    void setUp() {
        testObjective = new Objective();
        testObjective.setId("test-id");
        testObjective.setTitle("Test Objective");
        testObjective.setDescription("Test Description");
        testObjective.setOwnerId("owner-1");
        testObjective.setTeamId("team-1");
        testObjective.setQuarter("2025-Q1");
        testObjective.setStatus(ObjectiveStatus.NOT_STARTED);
        testObjective.setProgress(BigDecimal.ZERO);

        KeyResult kr1 = new KeyResult();
        kr1.setId("kr-1");
        kr1.setObjectiveId("test-id");
        kr1.setTitle("KR 1");
        kr1.setTargetValue(new BigDecimal("100"));
        kr1.setCurrentValue(new BigDecimal("50"));

        KeyResult kr2 = new KeyResult();
        kr2.setId("kr-2");
        kr2.setObjectiveId("test-id");
        kr2.setTitle("KR 2");
        kr2.setTargetValue(new BigDecimal("200"));
        kr2.setCurrentValue(new BigDecimal("100"));

        testKeyResults = Arrays.asList(kr1, kr2);
    }

    @Test
    void testCreateObjective_SetsDefaultStatusAndProgress() {
        // Given
        when(objectiveRepository.save(any(Objective.class))).thenReturn(testObjective);

        // When
        Objective result = objectiveService.create(testObjective);

        // Then
        assertEquals(ObjectiveStatus.NOT_STARTED, result.getStatus());
        assertEquals(BigDecimal.ZERO, result.getProgress());
        verify(objectiveRepository).save(testObjective);
    }

    @Test
    void testCalculateProgress_AverageOfKeyResults() {
        // Given
        when(keyResultRepository.findByObjectiveId("test-id")).thenReturn(testKeyResults);

        // When
        objectiveService.calculateProgress(testObjective);

        // Then
        // KR1: 50/100 = 50%, KR2: 100/200 = 50%, Average = 50%
        assertEquals(new BigDecimal("50.00"), testObjective.getProgress());
    }

    @Test
    void testUpdateStatus_OnTrackWhenProgressAbove70() {
        // Given
        testObjective.setProgress(new BigDecimal("75"));

        // When
        objectiveService.updateStatus(testObjective);

        // Then
        assertEquals(ObjectiveStatus.ON_TRACK, testObjective.getStatus());
    }

    @Test
    void testUpdateStatus_AtRiskWhenProgressBelow30() {
        // Given
        testObjective.setProgress(new BigDecimal("25"));

        // When
        objectiveService.updateStatus(testObjective);

        // Then
        assertEquals(ObjectiveStatus.AT_RISK, testObjective.getStatus());
    }

    @Test
    void testValidateKeyResultLimit_ReturnsTrueWhenUnderLimit() {
        // Given
        when(keyResultRepository.findByObjectiveId("test-id")).thenReturn(testKeyResults);

        // When
        boolean result = objectiveService.validateKeyResultLimit("test-id");

        // Then
        assertTrue(result);
    }

    @Test
    void testValidateKeyResultLimit_ReturnsFalseWhenAtLimit() {
        // Given
        List<KeyResult> fiveKeyResults = Arrays.asList(
            new KeyResult(), new KeyResult(), new KeyResult(), 
            new KeyResult(), new KeyResult()
        );
        when(keyResultRepository.findByObjectiveId("test-id")).thenReturn(fiveKeyResults);

        // When
        boolean result = objectiveService.validateKeyResultLimit("test-id");

        // Then
        assertFalse(result);
    }

    @Test
    void testDeleteById_DeletesKeyResultsFirst() {
        // Given
        when(keyResultRepository.findByObjectiveId("test-id")).thenReturn(testKeyResults);

        // When
        objectiveService.deleteById("test-id");

        // Then
        verify(keyResultRepository).deleteAll(testKeyResults);
        verify(objectiveRepository).deleteById("test-id");
    }
}

