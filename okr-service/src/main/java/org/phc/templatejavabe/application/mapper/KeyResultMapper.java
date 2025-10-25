package org.phc.templatejavabe.application.mapper;

import org.phc.templatejavabe.domain.model.KeyResult;
import org.phc.templatejavabe.domain.model.MetricType;
import org.phc.templatejavabe.presentation.request.keyresult.CreateKeyResultRequest;
import org.phc.templatejavabe.presentation.request.keyresult.UpdateKeyResultRequest;
import org.phc.templatejavabe.presentation.response.keyresult.KeyResultResponse;

import java.math.BigDecimal;

public class KeyResultMapper {
    public static KeyResult toEntity(CreateKeyResultRequest req) {
        KeyResult kr = new KeyResult();
        kr.setObjectiveId(req.objectiveId());
        kr.setTitle(req.title());
        
        // Handle metric type enum conversion
        try {
            kr.setMetricType(MetricType.valueOf(req.metricType()));
        } catch (IllegalArgumentException e) {
            kr.setMetricType(MetricType.NUMBER);
        }
        
        kr.setUnit(req.unit());
        kr.setTargetValue(req.targetValue());
        kr.setCurrentValue(req.currentValue());
        return kr;
    }

    public static void applyUpdate(KeyResult existing, UpdateKeyResultRequest req) {
        if (req.title() != null) existing.setTitle(req.title());
        if (req.metricType() != null) {
            try {
                existing.setMetricType(MetricType.valueOf(req.metricType()));
            } catch (IllegalArgumentException e) {
                // Keep existing metric type if invalid
            }
        }
        if (req.unit() != null) existing.setUnit(req.unit());
        if (req.targetValue() != null) existing.setTargetValue(req.targetValue());
        if (req.currentValue() != null) existing.setCurrentValue(req.currentValue());
    }

    public static KeyResultResponse toResponse(KeyResult kr) {
        return new KeyResultResponse(
            kr.getId(),
            kr.getObjectiveId(),
            kr.getTitle(),
            kr.getMetricType() != null ? kr.getMetricType().name() : null,
            kr.getUnit(),
            kr.getTargetValue(),
            kr.getCurrentValue(),
            kr.getWeight() != null ? kr.getWeight() : BigDecimal.ONE,
            kr.getCreatedDate(),
            kr.getLastModifiedDate()
        );
    }
}



