package org.phc.templatejavabe.domain.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.phc.templatejavabe.domain.model.Objective;
import org.phc.templatejavabe.domain.model.ObjectiveStatus;
import org.phc.templatejavabe.domain.model.ObjectiveType;
import org.phc.templatejavabe.domain.model.KeyResult;
import org.phc.templatejavabe.infrastructure.repository.ObjectiveRepository;
import org.phc.templatejavabe.infrastructure.repository.KeyResultRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ObjectiveService {
    private final ObjectiveRepository objectiveRepository;
    private final KeyResultRepository keyResultRepository;

    public ObjectiveService(ObjectiveRepository objectiveRepository, KeyResultRepository keyResultRepository) {
        this.objectiveRepository = objectiveRepository;
        this.keyResultRepository = keyResultRepository;
    }

    public List<Objective> findAll() { return objectiveRepository.findAll(); }
    public Optional<Objective> findById(String id) { return objectiveRepository.findById(id); }

    public List<Objective> findByWorkspace(String workspaceId) {
        return objectiveRepository.findByWorkspaceId(workspaceId);
    }

    public List<Objective> findByWorkspaceAndQuarter(String workspaceId, String quarter) {
        return objectiveRepository.findByWorkspaceIdAndQuarter(workspaceId, quarter);
    }

    public List<Objective> findByOwnerAndQuarter(String ownerId, String quarter) {
        return objectiveRepository.findByOwnerIdAndQuarter(ownerId, quarter);
    }

    public List<Objective> findByTeamAndQuarter(String teamId, String quarter) {
        return objectiveRepository.findByTeamIdAndQuarter(teamId, quarter);
    }

    public List<Objective> findKPIsByParentId(String parentId) {
        return objectiveRepository.findByParentIdAndType(parentId, ObjectiveType.KPI);
    }

    @Transactional
    public Objective create(Objective o) { 
        // Set default status
        if (o.getStatus() == null) {
            o.setStatus(ObjectiveStatus.NOT_STARTED);
        }
        o.setProgress(BigDecimal.ZERO);
        return objectiveRepository.save(o); 
    }

    @Transactional
    public Objective update(Objective o) { 
        // Recalculate progress when updating
        calculateProgress(o);
        updateStatus(o);
        return objectiveRepository.save(o); 
    }

    @Transactional
    public void deleteById(String id) { 
        // Delete all key results first
        List<KeyResult> keyResults = keyResultRepository.findByObjectiveId(id);
        keyResultRepository.deleteAll(keyResults);
        objectiveRepository.deleteById(id); 
    }

    /**
     * Calculate progress based on weighted average of all Key Results
     */
    public void calculateProgress(Objective objective) {
        List<KeyResult> keyResults = keyResultRepository.findByObjectiveId(objective.getId());
        
        if (keyResults.isEmpty()) {
            objective.setProgress(BigDecimal.ZERO);
            return;
        }

        // Calculate weighted progress
        BigDecimal totalWeightedProgress = BigDecimal.ZERO;
        BigDecimal totalWeight = BigDecimal.ZERO;

        for (KeyResult kr : keyResults) {
            BigDecimal progress = calculateKeyResultProgress(kr);
            BigDecimal weight = kr.getWeight() != null ? kr.getWeight() : BigDecimal.ONE;
            
            totalWeightedProgress = totalWeightedProgress.add(progress.multiply(weight));
            totalWeight = totalWeight.add(weight);
        }

        if (totalWeight.compareTo(BigDecimal.ZERO) == 0) {
            objective.setProgress(BigDecimal.ZERO);
        } else {
            BigDecimal weightedAverage = totalWeightedProgress.divide(totalWeight, 2, RoundingMode.HALF_UP);
            objective.setProgress(weightedAverage);
        }
    }

    /**
     * Calculate progress percentage for a Key Result
     */
    private BigDecimal calculateKeyResultProgress(KeyResult keyResult) {
        if (keyResult.getTargetValue() == null || keyResult.getTargetValue().compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        if (keyResult.getCurrentValue() == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal progress = keyResult.getCurrentValue()
            .divide(keyResult.getTargetValue(), 4, RoundingMode.HALF_UP)
            .multiply(BigDecimal.valueOf(100));

        // Cap at 100%
        return progress.min(BigDecimal.valueOf(100));
    }

    /**
     * Update objective status based on progress and quarter timing
     */
    public void updateStatus(Objective objective) {
        if (objective.getProgress() == null) {
            objective.setStatus(ObjectiveStatus.NOT_STARTED);
            return;
        }

        BigDecimal progress = objective.getProgress();
        boolean isNearDeadline = isNearQuarterDeadline(objective.getQuarter());

        if (progress.compareTo(BigDecimal.valueOf(70)) >= 0) {
            objective.setStatus(ObjectiveStatus.ON_TRACK);
        } else if (progress.compareTo(BigDecimal.valueOf(30)) < 0) {
            objective.setStatus(ObjectiveStatus.AT_RISK);
        } else if (isNearDeadline) {
            objective.setStatus(ObjectiveStatus.BEHIND);
        } else {
            objective.setStatus(ObjectiveStatus.ON_TRACK);
        }
    }

    /**
     * Check if we're near the quarter deadline (last month of quarter)
     */
    private boolean isNearQuarterDeadline(String quarter) {
        try {
            // Parse quarter like "2025-Q1"
            String[] parts = quarter.split("-Q");
            int year = Integer.parseInt(parts[0]);
            int quarterNum = Integer.parseInt(parts[1]);

            // Calculate quarter end month
            int endMonth = quarterNum * 3;
            LocalDate quarterEnd = LocalDate.of(year, endMonth, 1).withDayOfMonth(1).plusMonths(1).minusDays(1);
            LocalDate now = LocalDate.now();

            // Consider "near deadline" if within 30 days of quarter end
            return now.plusDays(30).isAfter(quarterEnd);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Validate that objective doesn't have more than 5 Key Results (OKR best practice)
     */
    public boolean validateKeyResultLimit(String objectiveId) {
        List<KeyResult> keyResults = keyResultRepository.findByObjectiveId(objectiveId);
        return keyResults.size() < 5;
    }

    /**
     * Duplicate an objective with all its key results
     */
    @Transactional
    public Objective duplicate(Objective source) {
        // Create new objective
        Objective duplicate = new Objective();
        duplicate.setTitle("Copy of " + source.getTitle());
        duplicate.setDescription(source.getDescription());
        duplicate.setOwnerId(source.getOwnerId());
        duplicate.setTeamId(source.getTeamId());
        duplicate.setWorkspaceId(source.getWorkspaceId());
        duplicate.setQuarter(source.getQuarter());
        duplicate.setType(source.getType());
        duplicate.setGroups(source.getGroups());
        duplicate.setLabels(source.getLabels());
        duplicate.setStakeholders(source.getStakeholders());
        duplicate.setStartDate(source.getStartDate());
        duplicate.setEndDate(source.getEndDate());
        duplicate.setParentId(source.getParentId());
        
        // Set default values for new objective
        duplicate.setStatus(ObjectiveStatus.NOT_STARTED);
        duplicate.setProgress(BigDecimal.ZERO);
        duplicate.setWeight(source.getWeight() != null ? source.getWeight() : BigDecimal.ONE);
        
        // Save the new objective
        Objective savedObjective = objectiveRepository.save(duplicate);
        
        // Duplicate all key results
        List<KeyResult> sourceKeyResults = keyResultRepository.findByObjectiveId(source.getId());
        for (KeyResult sourceKr : sourceKeyResults) {
            KeyResult duplicateKr = new KeyResult();
            duplicateKr.setObjectiveId(savedObjective.getId());
            duplicateKr.setTitle(sourceKr.getTitle());
            duplicateKr.setMetricType(sourceKr.getMetricType());
            duplicateKr.setUnit(sourceKr.getUnit());
            duplicateKr.setTargetValue(sourceKr.getTargetValue());
            duplicateKr.setCurrentValue(BigDecimal.ZERO); // Reset current value
            keyResultRepository.save(duplicateKr);
        }
        
        return savedObjective;
    }

    /**
     * Move an objective to a different team or workspace
     */
    @Transactional
    public Objective move(Objective objective, String newTeamId, String newWorkspaceId) {
        if (newTeamId != null && !newTeamId.trim().isEmpty()) {
            objective.setTeamId(newTeamId);
        }
        if (newWorkspaceId != null && !newWorkspaceId.trim().isEmpty()) {
            objective.setWorkspaceId(newWorkspaceId);
        }
        return objectiveRepository.save(objective);
    }
}



