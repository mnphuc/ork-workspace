package org.phc.templatejavabe.domain.service;

import java.util.List;
import java.util.Optional;
import org.phc.templatejavabe.domain.model.Threshold;
import org.phc.templatejavabe.infrastructure.repository.ThresholdRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ThresholdService {
    private final ThresholdRepository thresholdRepository;

    public ThresholdService(ThresholdRepository thresholdRepository) {
        this.thresholdRepository = thresholdRepository;
    }

    public List<Threshold> findByObjectiveId(String objectiveId) {
        return thresholdRepository.findByObjectiveId(objectiveId);
    }

    public Optional<Threshold> findById(String id) {
        return thresholdRepository.findById(id);
    }

    @Transactional
    public Threshold create(Threshold threshold) {
        return thresholdRepository.save(threshold);
    }

    @Transactional
    public Threshold update(Threshold threshold) {
        return thresholdRepository.save(threshold);
    }

    @Transactional
    public void deleteById(String id) {
        thresholdRepository.deleteById(id);
    }

    @Transactional
    public void deleteByObjectiveId(String objectiveId) {
        thresholdRepository.deleteByObjectiveId(objectiveId);
    }
}
