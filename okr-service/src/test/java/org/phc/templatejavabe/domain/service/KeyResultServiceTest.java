package org.phc.templatejavabe.domain.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.phc.templatejavabe.domain.model.KeyResult;
import org.phc.templatejavabe.domain.model.MetricType;
import org.phc.templatejavabe.infrastructure.repository.KeyResultRepository;

@ExtendWith(MockitoExtension.class)
class KeyResultServiceTest {

    @Mock
    private KeyResultRepository keyResultRepository;

    private KeyResultService keyResultService;

    @BeforeEach
    void setUp() {
        keyResultService = new KeyResultService(keyResultRepository);
    }

    @Test
    void create_ShouldSetCurrentValueToZero() {
        // Given
        KeyResult keyResult = new KeyResult();
        keyResult.setTitle("Test Key Result");
        keyResult.setMetricType(MetricType.NUMBER);
        keyResult.setUnit("users");
        keyResult.setTargetValue(BigDecimal.valueOf(100));
        keyResult.setCurrentValue(BigDecimal.valueOf(50)); // Should be reset to 0
        
        KeyResult savedKeyResult = new KeyResult();
        savedKeyResult.setId("kr-1");
        savedKeyResult.setTitle("Test Key Result");
        savedKeyResult.setMetricType(MetricType.NUMBER);
        savedKeyResult.setUnit("users");
        savedKeyResult.setTargetValue(BigDecimal.valueOf(100));
        savedKeyResult.setCurrentValue(BigDecimal.ZERO);
        
        when(keyResultRepository.save(any(KeyResult.class))).thenReturn(savedKeyResult);

        // When
        KeyResult result = keyResultService.create(keyResult);

        // Then
        assertNotNull(result);
        assertEquals(BigDecimal.ZERO, result.getCurrentValue());
        verify(keyResultRepository).save(keyResult);
    }

    @Test
    void create_ShouldThrowException_WhenTargetValueIsZero() {
        // Given
        KeyResult keyResult = new KeyResult();
        keyResult.setTitle("Test Key Result");
        keyResult.setMetricType(MetricType.NUMBER);
        keyResult.setUnit("users");
        keyResult.setTargetValue(BigDecimal.ZERO);

        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> keyResultService.create(keyResult)
        );
        
        assertEquals("Target value phải lớn hơn 0", exception.getMessage());
    }

    @Test
    void create_ShouldThrowException_WhenTargetValueIsNegative() {
        // Given
        KeyResult keyResult = new KeyResult();
        keyResult.setTitle("Test Key Result");
        keyResult.setMetricType(MetricType.NUMBER);
        keyResult.setUnit("users");
        keyResult.setTargetValue(BigDecimal.valueOf(-10));

        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> keyResultService.create(keyResult)
        );
        
        assertEquals("Target value phải lớn hơn 0", exception.getMessage());
    }

    @Test
    void create_ShouldThrowException_WhenCurrentValueIsNegative() {
        // Given
        KeyResult keyResult = new KeyResult();
        keyResult.setTitle("Test Key Result");
        keyResult.setMetricType(MetricType.NUMBER);
        keyResult.setUnit("users");
        keyResult.setTargetValue(BigDecimal.valueOf(100));
        keyResult.setCurrentValue(BigDecimal.valueOf(-5));

        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> keyResultService.create(keyResult)
        );
        
        assertEquals("Current value không được âm", exception.getMessage());
    }

    @Test
    void create_ShouldThrowException_WhenPercentTargetValueExceeds100() {
        // Given
        KeyResult keyResult = new KeyResult();
        keyResult.setTitle("Test Key Result");
        keyResult.setMetricType(MetricType.PERCENT);
        keyResult.setUnit("%");
        keyResult.setTargetValue(BigDecimal.valueOf(150));

        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> keyResultService.create(keyResult)
        );
        
        assertEquals("Target value cho PERCENT metric không được vượt quá 100", exception.getMessage());
    }

    @Test
    void create_ShouldThrowException_WhenPercentCurrentValueExceeds100() {
        // Given
        KeyResult keyResult = new KeyResult();
        keyResult.setTitle("Test Key Result");
        keyResult.setMetricType(MetricType.PERCENT);
        keyResult.setUnit("%");
        keyResult.setTargetValue(BigDecimal.valueOf(100));
        keyResult.setCurrentValue(BigDecimal.valueOf(120));

        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> keyResultService.create(keyResult)
        );
        
        assertEquals("Current value cho PERCENT metric không được vượt quá 100", exception.getMessage());
    }

    @Test
    void updateProgress_ShouldUpdateCurrentValue() {
        // Given
        String keyResultId = "kr-1";
        BigDecimal newValue = BigDecimal.valueOf(75);
        
        KeyResult keyResult = new KeyResult();
        keyResult.setId(keyResultId);
        keyResult.setTitle("Test Key Result");
        keyResult.setCurrentValue(BigDecimal.valueOf(50));
        
        KeyResult updatedKeyResult = new KeyResult();
        updatedKeyResult.setId(keyResultId);
        updatedKeyResult.setTitle("Test Key Result");
        updatedKeyResult.setCurrentValue(newValue);
        
        when(keyResultRepository.findById(keyResultId)).thenReturn(Optional.of(keyResult));
        when(keyResultRepository.save(any(KeyResult.class))).thenReturn(updatedKeyResult);

        // When
        KeyResult result = keyResultService.updateProgress(keyResultId, newValue);

        // Then
        assertNotNull(result);
        assertEquals(newValue, result.getCurrentValue());
        verify(keyResultRepository).save(keyResult);
    }

    @Test
    void updateProgress_ShouldThrowException_WhenKeyResultNotFound() {
        // Given
        String keyResultId = "non-existent";
        BigDecimal newValue = BigDecimal.valueOf(75);
        
        when(keyResultRepository.findById(keyResultId)).thenReturn(Optional.empty());

        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> keyResultService.updateProgress(keyResultId, newValue)
        );
        
        assertEquals("Key Result không tồn tại", exception.getMessage());
    }

    @Test
    void calculateProgressPercentage_ShouldReturnCorrectPercentage() {
        // Given
        KeyResult keyResult = new KeyResult();
        keyResult.setCurrentValue(BigDecimal.valueOf(75));
        keyResult.setTargetValue(BigDecimal.valueOf(100));

        // When
        BigDecimal result = keyResultService.calculateProgressPercentage(keyResult);

        // Then
        assertEquals(BigDecimal.valueOf(75), result);
    }

    @Test
    void calculateProgressPercentage_ShouldReturnZero_WhenTargetValueIsZero() {
        // Given
        KeyResult keyResult = new KeyResult();
        keyResult.setCurrentValue(BigDecimal.valueOf(75));
        keyResult.setTargetValue(BigDecimal.ZERO);

        // When
        BigDecimal result = keyResultService.calculateProgressPercentage(keyResult);

        // Then
        assertEquals(BigDecimal.ZERO, result);
    }

    @Test
    void calculateProgressPercentage_ShouldReturnZero_WhenTargetValueIsNull() {
        // Given
        KeyResult keyResult = new KeyResult();
        keyResult.setCurrentValue(BigDecimal.valueOf(75));
        keyResult.setTargetValue(null);

        // When
        BigDecimal result = keyResultService.calculateProgressPercentage(keyResult);

        // Then
        assertEquals(BigDecimal.ZERO, result);
    }

    @Test
    void calculateProgressPercentage_ShouldCapAt100() {
        // Given
        KeyResult keyResult = new KeyResult();
        keyResult.setCurrentValue(BigDecimal.valueOf(150));
        keyResult.setTargetValue(BigDecimal.valueOf(100));

        // When
        BigDecimal result = keyResultService.calculateProgressPercentage(keyResult);

        // Then
        assertEquals(BigDecimal.valueOf(100), result);
    }

    @Test
    void findByObjectiveId_ShouldReturnKeyResults() {
        // Given
        String objectiveId = "obj-1";
        
        KeyResult keyResult1 = new KeyResult();
        keyResult1.setId("kr-1");
        keyResult1.setObjectiveId(objectiveId);
        
        KeyResult keyResult2 = new KeyResult();
        keyResult2.setId("kr-2");
        keyResult2.setObjectiveId(objectiveId);
        
        List<KeyResult> keyResults = Arrays.asList(keyResult1, keyResult2);
        
        when(keyResultRepository.findByObjectiveId(objectiveId)).thenReturn(keyResults);

        // When
        List<KeyResult> result = keyResultService.findByObjectiveId(objectiveId);

        // Then
        assertEquals(2, result.size());
        assertEquals("kr-1", result.get(0).getId());
        assertEquals("kr-2", result.get(1).getId());
    }

    @Test
    void findById_ShouldReturnKeyResult() {
        // Given
        String keyResultId = "kr-1";
        KeyResult keyResult = new KeyResult();
        keyResult.setId(keyResultId);
        
        when(keyResultRepository.findById(keyResultId)).thenReturn(Optional.of(keyResult));

        // When
        Optional<KeyResult> result = keyResultService.findById(keyResultId);

        // Then
        assertTrue(result.isPresent());
        assertEquals(keyResultId, result.get().getId());
    }

    @Test
    void findById_ShouldReturnEmpty_WhenNotFound() {
        // Given
        String keyResultId = "non-existent";
        
        when(keyResultRepository.findById(keyResultId)).thenReturn(Optional.empty());

        // When
        Optional<KeyResult> result = keyResultService.findById(keyResultId);

        // Then
        assertFalse(result.isPresent());
    }

    @Test
    void delete_ShouldCallRepositoryDelete() {
        // Given
        String keyResultId = "kr-1";

        // When
        keyResultService.delete(keyResultId);

        // Then
        verify(keyResultRepository).deleteById(keyResultId);
    }
}
