package org.phc.templatejavabe.domain.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.phc.templatejavabe.domain.model.CheckIn;
import org.phc.templatejavabe.domain.model.KeyResult;
import org.phc.templatejavabe.domain.model.MetricType;
import org.phc.templatejavabe.domain.model.Objective;
import org.phc.templatejavabe.infrastructure.repository.CheckInRepository;
import org.phc.templatejavabe.infrastructure.repository.KeyResultRepository;
import org.phc.templatejavabe.infrastructure.repository.ObjectiveRepository;

@ExtendWith(MockitoExtension.class)
class CheckInServiceTest {

    @Mock
    private CheckInRepository checkInRepository;
    
    @Mock
    private KeyResultRepository keyResultRepository;
    
    @Mock
    private ObjectiveRepository objectiveRepository;
    
    @Mock
    private KeyResultService keyResultService;

    private CheckInService checkInService;

    @BeforeEach
    void setUp() {
        checkInService = new CheckInService(
            checkInRepository, 
            keyResultRepository, 
            objectiveRepository, 
            keyResultService
        );
    }

    @Test
    void create_ShouldUpdateKeyResultAndObjectiveProgress() {
        // Given
        String keyResultId = "kr-1";
        String objectiveId = "obj-1";
        
        KeyResult keyResult = new KeyResult();
        keyResult.setId(keyResultId);
        keyResult.setObjectiveId(objectiveId);
        keyResult.setCurrentValue(BigDecimal.valueOf(50));
        
        CheckIn checkIn = new CheckIn();
        checkIn.setValue(BigDecimal.valueOf(75));
        checkIn.setNote("Great progress!");
        
        Objective objective = new Objective();
        objective.setId(objectiveId);
        objective.setProgress(60);
        
        List<KeyResult> keyResults = Arrays.asList(keyResult);
        
        when(keyResultRepository.findById(keyResultId)).thenReturn(Optional.of(keyResult));
        when(checkInRepository.findByKeyResultIdOrderByCreatedDateDesc(keyResultId)).thenReturn(Arrays.asList());
        when(checkInRepository.save(any(CheckIn.class))).thenReturn(checkIn);
        when(keyResultService.update(any(KeyResult.class))).thenReturn(keyResult);
        when(keyResultRepository.findByObjectiveId(objectiveId)).thenReturn(keyResults);
        when(keyResultService.calculateProgressPercentage(any(KeyResult.class))).thenReturn(BigDecimal.valueOf(75));
        when(objectiveRepository.findById(objectiveId)).thenReturn(Optional.of(objective));
        when(objectiveRepository.save(any(Objective.class))).thenReturn(objective);

        // When
        CheckIn result = checkInService.create(keyResultId, checkIn);

        // Then
        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(75), result.getValue());
        assertEquals("Great progress!", result.getNote());
        assertEquals(keyResultId, result.getKeyResultId());
        
        verify(keyResultService).update(keyResult);
        verify(objectiveRepository).save(objective);
        verify(checkInRepository).save(checkIn);
    }

    @Test
    void create_ShouldThrowException_WhenKeyResultNotFound() {
        // Given
        String keyResultId = "non-existent";
        CheckIn checkIn = new CheckIn();
        
        when(keyResultRepository.findById(keyResultId)).thenReturn(Optional.empty());

        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> checkInService.create(keyResultId, checkIn)
        );
        
        assertEquals("KeyResult không tồn tại", exception.getMessage());
    }

    @Test
    void update_ShouldUpdateKeyResultAndObjectiveProgress() {
        // Given
        String checkInId = "ci-1";
        String keyResultId = "kr-1";
        String objectiveId = "obj-1";
        
        CheckIn existingCheckIn = new CheckIn();
        existingCheckIn.setId(checkInId);
        existingCheckIn.setKeyResultId(keyResultId);
        existingCheckIn.setValue(BigDecimal.valueOf(50));
        existingCheckIn.setCreatedDate(Instant.now().minusSeconds(3600)); // 1 hour ago
        
        CheckIn updatedCheckIn = new CheckIn();
        updatedCheckIn.setValue(BigDecimal.valueOf(80));
        updatedCheckIn.setNote("Updated progress");
        
        KeyResult keyResult = new KeyResult();
        keyResult.setId(keyResultId);
        keyResult.setObjectiveId(objectiveId);
        
        Objective objective = new Objective();
        objective.setId(objectiveId);
        
        when(checkInRepository.findById(checkInId)).thenReturn(Optional.of(existingCheckIn));
        when(checkInRepository.save(any(CheckIn.class))).thenReturn(existingCheckIn);
        when(keyResultRepository.findById(keyResultId)).thenReturn(Optional.of(keyResult));
        when(keyResultService.update(any(KeyResult.class))).thenReturn(keyResult);
        when(keyResultRepository.findByObjectiveId(objectiveId)).thenReturn(Arrays.asList(keyResult));
        when(keyResultService.calculateProgressPercentage(any(KeyResult.class))).thenReturn(BigDecimal.valueOf(80));
        when(objectiveRepository.findById(objectiveId)).thenReturn(Optional.of(objective));
        when(objectiveRepository.save(any(Objective.class))).thenReturn(objective);

        // When
        CheckIn result = checkInService.update(checkInId, updatedCheckIn);

        // Then
        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(80), result.getValue());
        assertEquals("Updated progress", result.getNote());
        
        verify(keyResultService).update(keyResult);
        verify(objectiveRepository).save(objective);
    }

    @Test
    void update_ShouldThrowException_WhenCheckInNotFound() {
        // Given
        String checkInId = "non-existent";
        CheckIn updatedCheckIn = new CheckIn();
        
        when(checkInRepository.findById(checkInId)).thenReturn(Optional.empty());

        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> checkInService.update(checkInId, updatedCheckIn)
        );
        
        assertEquals("CheckIn không tồn tại", exception.getMessage());
    }

    @Test
    void update_ShouldThrowException_WhenOutside24Hours() {
        // Given
        String checkInId = "ci-1";
        CheckIn existingCheckIn = new CheckIn();
        existingCheckIn.setId(checkInId);
        existingCheckIn.setCreatedDate(Instant.now().minusSeconds(25 * 60 * 60)); // 25 hours ago
        
        CheckIn updatedCheckIn = new CheckIn();
        
        when(checkInRepository.findById(checkInId)).thenReturn(Optional.of(existingCheckIn));

        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> checkInService.update(checkInId, updatedCheckIn)
        );
        
        assertEquals("Chỉ có thể cập nhật check-in trong vòng 24 giờ", exception.getMessage());
    }

    @Test
    void delete_ShouldUpdateKeyResultToPreviousValue() {
        // Given
        String checkInId = "ci-1";
        String keyResultId = "kr-1";
        String objectiveId = "obj-1";
        
        CheckIn checkInToDelete = new CheckIn();
        checkInToDelete.setId(checkInId);
        checkInToDelete.setKeyResultId(keyResultId);
        checkInToDelete.setValue(BigDecimal.valueOf(80));
        
        CheckIn previousCheckIn = new CheckIn();
        previousCheckIn.setValue(BigDecimal.valueOf(60));
        
        KeyResult keyResult = new KeyResult();
        keyResult.setId(keyResultId);
        keyResult.setObjectiveId(objectiveId);
        
        Objective objective = new Objective();
        objective.setId(objectiveId);
        
        when(checkInRepository.findById(checkInId)).thenReturn(Optional.of(checkInToDelete));
        when(checkInRepository.findByKeyResultIdOrderByCreatedDateDesc(keyResultId))
            .thenReturn(Arrays.asList(previousCheckIn));
        when(keyResultRepository.findById(keyResultId)).thenReturn(Optional.of(keyResult));
        when(keyResultService.update(any(KeyResult.class))).thenReturn(keyResult);
        when(keyResultRepository.findByObjectiveId(objectiveId)).thenReturn(Arrays.asList(keyResult));
        when(keyResultService.calculateProgressPercentage(any(KeyResult.class))).thenReturn(BigDecimal.valueOf(60));
        when(objectiveRepository.findById(objectiveId)).thenReturn(Optional.of(objective));
        when(objectiveRepository.save(any(Objective.class))).thenReturn(objective);

        // When
        checkInService.delete(checkInId);

        // Then
        verify(checkInRepository).deleteById(checkInId);
        verify(keyResultService).update(keyResult);
        verify(objectiveRepository).save(objective);
    }

    @Test
    void getCheckInHistory_ShouldReturnSortedCheckIns() {
        // Given
        String keyResultId = "kr-1";
        
        CheckIn checkIn1 = new CheckIn();
        checkIn1.setId("ci-1");
        checkIn1.setValue(BigDecimal.valueOf(50));
        
        CheckIn checkIn2 = new CheckIn();
        checkIn2.setId("ci-2");
        checkIn2.setValue(BigDecimal.valueOf(75));
        
        List<CheckIn> checkIns = Arrays.asList(checkIn2, checkIn1); // Desc order from repo
        
        when(checkInRepository.findByKeyResultIdOrderByCreatedDateAsc(keyResultId))
            .thenReturn(Arrays.asList(checkIn1, checkIn2)); // Asc order

        // When
        List<CheckIn> result = checkInService.getCheckInHistory(keyResultId);

        // Then
        assertEquals(2, result.size());
        assertEquals("ci-1", result.get(0).getId());
        assertEquals("ci-2", result.get(1).getId());
    }
}
