package org.phc.templatejavabe.domain.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.phc.templatejavabe.domain.model.KeyResult;
import org.phc.templatejavabe.domain.model.MetricType;
import org.phc.templatejavabe.infrastructure.repository.KeyResultRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class KeyResultService {
    private final KeyResultRepository keyResultRepository;

    public KeyResultService(KeyResultRepository keyResultRepository) {
        this.keyResultRepository = keyResultRepository;
    }

    public List<KeyResult> findAll() {
        return keyResultRepository.findAll();
    }

    public List<KeyResult> findByObjectiveId(String objectiveId) {
        return keyResultRepository.findByObjectiveId(objectiveId);
    }

    public Optional<KeyResult> findById(String id) {
        return keyResultRepository.findById(id);
    }

    @Transactional
    public KeyResult create(KeyResult keyResult) {
        validateMetric(keyResult);
        keyResult.setCurrentValue(BigDecimal.ZERO);
        if (keyResult.getWeight() == null) {
            keyResult.setWeight(BigDecimal.ONE);
        }
        return keyResultRepository.save(keyResult);
    }

    @Transactional
    public KeyResult update(KeyResult keyResult) {
        validateMetric(keyResult);
        return keyResultRepository.save(keyResult);
    }

    @Transactional
    public void delete(String id) {
        keyResultRepository.deleteById(id);
    }

    @Transactional
    public KeyResult updateProgress(String keyResultId, BigDecimal newValue) {
        KeyResult keyResult = keyResultRepository.findById(keyResultId)
            .orElseThrow(() -> new IllegalArgumentException("Key Result không tồn tại"));
        
        keyResult.setCurrentValue(newValue);
        return keyResultRepository.save(keyResult);
    }

    private void validateMetric(KeyResult keyResult) {
        if (keyResult.getMetricType() == null) {
            keyResult.setMetricType(MetricType.NUMBER);
        }
        
        if (keyResult.getTargetValue() == null || keyResult.getTargetValue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Target value phải lớn hơn 0");
        }
        
        if (keyResult.getCurrentValue() == null || keyResult.getCurrentValue().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Current value không được âm");
        }
        
        // Validate PERCENT metrics
        if (keyResult.getMetricType() == MetricType.PERCENT) {
            if (keyResult.getTargetValue().compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new IllegalArgumentException("Target value cho PERCENT metric không được vượt quá 100");
            }
            if (keyResult.getCurrentValue().compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new IllegalArgumentException("Current value cho PERCENT metric không được vượt quá 100");
            }
        }
    }

    public BigDecimal calculateProgressPercentage(KeyResult keyResult) {
        if (keyResult.getTargetValue() == null || keyResult.getTargetValue().compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal progress = keyResult.getCurrentValue()
            .divide(keyResult.getTargetValue(), 4, BigDecimal.ROUND_HALF_UP)
            .multiply(BigDecimal.valueOf(100));
        
        return progress.min(BigDecimal.valueOf(100));
    }

    /**
     * Duplicate a key result
     */
    @Transactional
    public KeyResult duplicate(KeyResult source) {
        KeyResult duplicate = new KeyResult();
        duplicate.setObjectiveId(source.getObjectiveId());
        duplicate.setTitle("Copy of " + source.getTitle());
        duplicate.setMetricType(source.getMetricType());
        duplicate.setUnit(source.getUnit());
        duplicate.setTargetValue(source.getTargetValue());
        duplicate.setCurrentValue(BigDecimal.ZERO); // Reset current value
        duplicate.setWeight(source.getWeight() != null ? source.getWeight() : BigDecimal.ONE);
        return keyResultRepository.save(duplicate);
    }
}



