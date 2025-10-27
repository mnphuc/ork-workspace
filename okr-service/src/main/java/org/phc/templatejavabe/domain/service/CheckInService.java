package org.phc.templatejavabe.domain.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import org.phc.templatejavabe.domain.model.CheckIn;
import org.phc.templatejavabe.domain.model.KeyResult;
import org.phc.templatejavabe.domain.model.Objective;
import org.phc.templatejavabe.infrastructure.repository.CheckInRepository;
import org.phc.templatejavabe.infrastructure.repository.KeyResultRepository;
import org.phc.templatejavabe.infrastructure.repository.ObjectiveRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CheckInService {
    private final CheckInRepository checkInRepository;
    private final KeyResultRepository keyResultRepository;
    private final ObjectiveRepository objectiveRepository;
    private final KeyResultService keyResultService;

    public CheckInService(CheckInRepository checkInRepository, 
                         KeyResultRepository keyResultRepository,
                         ObjectiveRepository objectiveRepository,
                         KeyResultService keyResultService) {
        this.checkInRepository = checkInRepository;
        this.keyResultRepository = keyResultRepository;
        this.objectiveRepository = objectiveRepository;
        this.keyResultService = keyResultService;
    }

    public List<CheckIn> list(String keyResultId) {
        return checkInRepository.findByKeyResultIdOrderByCreatedDateDesc(keyResultId);
    }

    public List<CheckIn> getRecentCheckIns(int limit) {
        return checkInRepository.findTop10ByOrderByCreatedDateDesc();
    }

    public List<CheckIn> getCheckInHistory(String keyResultId) {
        return checkInRepository.findByKeyResultIdOrderByCreatedDateAsc(keyResultId);
    }

    public Optional<CheckIn> findById(String checkInId) {
        return checkInRepository.findById(checkInId);
    }

    @Transactional
    public CheckIn create(String keyResultId, CheckIn c) {
        KeyResult kr = keyResultRepository.findById(keyResultId)
            .orElseThrow(() -> new IllegalArgumentException("KeyResult không tồn tại"));
        
        // Validate no duplicate check-in on same day
        // Temporarily disabled for testing
        // if (hasCheckInToday(keyResultId)) {
        //     throw new IllegalArgumentException("Đã có check-in hôm nay cho Key Result này");
        // }
        
        c.setKeyResultId(kr.getId());
        // Get current authenticated user
        org.springframework.security.core.Authentication auth = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) 
            ? auth.getName() : "system";
        c.setCreatedBy(currentUserId);
        c.setCreatedDate(Instant.now());
        CheckIn saved = checkInRepository.save(c);
        
        // Update Key Result current value
        kr.setCurrentValue(c.getValue());
        // Ensure current value is not null and not negative
        if (kr.getCurrentValue() == null) {
            kr.setCurrentValue(BigDecimal.ZERO);
        }
        if (kr.getCurrentValue().compareTo(BigDecimal.ZERO) < 0) {
            kr.setCurrentValue(BigDecimal.ZERO);
        }
        keyResultService.update(kr);
        
        // Update Objective progress
        updateObjectiveProgress(kr.getObjectiveId());
        
        return saved;
    }

    @Transactional
    public CheckIn update(String checkInId, CheckIn updatedCheckIn) {
        CheckIn existing = checkInRepository.findById(checkInId)
            .orElseThrow(() -> new IllegalArgumentException("CheckIn không tồn tại"));
        
        // Only allow update within 24 hours
        if (!isWithin24Hours(existing.getCreatedDate())) {
            throw new IllegalArgumentException("Chỉ có thể cập nhật check-in trong vòng 24 giờ");
        }
        
        existing.setValue(updatedCheckIn.getValue());
        existing.setNote(updatedCheckIn.getNote());
        
        CheckIn saved = checkInRepository.save(existing);
        
        // Update Key Result current value
        KeyResult kr = keyResultRepository.findById(existing.getKeyResultId()).orElse(null);
        if (kr != null) {
            kr.setCurrentValue(saved.getValue());
            // Ensure current value is not null and not negative
            if (kr.getCurrentValue() == null) {
                kr.setCurrentValue(BigDecimal.ZERO);
            }
            if (kr.getCurrentValue().compareTo(BigDecimal.ZERO) < 0) {
                kr.setCurrentValue(BigDecimal.ZERO);
            }
            keyResultService.update(kr);
            
            // Update Objective progress
            updateObjectiveProgress(kr.getObjectiveId());
        }
        
        return saved;
    }

    @Transactional
    public void delete(String checkInId) {
        CheckIn checkIn = checkInRepository.findById(checkInId)
            .orElseThrow(() -> new IllegalArgumentException("CheckIn không tồn tại"));
        
        checkInRepository.deleteById(checkInId);
        
        // Update Key Result to previous check-in value or 0
        String keyResultId = checkIn.getKeyResultId();
        List<CheckIn> remainingCheckIns = checkInRepository.findByKeyResultIdOrderByCreatedDateDesc(keyResultId);
        
        KeyResult kr = keyResultRepository.findById(keyResultId).orElse(null);
        if (kr != null) {
            if (remainingCheckIns.isEmpty()) {
                kr.setCurrentValue(BigDecimal.ZERO);
            } else {
                kr.setCurrentValue(remainingCheckIns.get(0).getValue());
            }
            keyResultService.update(kr);
            
            // Update Objective progress
            updateObjectiveProgress(kr.getObjectiveId());
        }
    }

    /**
     * Check if there's already a check-in today for this Key Result
     */
    private boolean hasCheckInToday(String keyResultId) {
        LocalDate today = LocalDate.now();
        Instant startOfDay = today.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endOfDay = today.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
        
        List<CheckIn> todayCheckIns = checkInRepository.findByKeyResultIdOrderByCreatedDateDesc(keyResultId)
            .stream()
            .filter(checkIn -> {
                Instant createdDate = checkIn.getCreatedDate();
                return createdDate != null && 
                       createdDate.isAfter(startOfDay) && 
                       createdDate.isBefore(endOfDay);
            })
            .toList();
        
        return !todayCheckIns.isEmpty();
    }

    /**
     * Check if the check-in is within 24 hours of creation
     */
    private boolean isWithin24Hours(Instant createdDate) {
        Instant now = Instant.now();
        Instant twentyFourHoursAgo = now.minusSeconds(24 * 60 * 60);
        return createdDate.isAfter(twentyFourHoursAgo);
    }

    /**
     * Update Objective progress based on its Key Results
     */
    private void updateObjectiveProgress(String objectiveId) {
        Objective objective = objectiveRepository.findById(objectiveId).orElse(null);
        if (objective == null) return;

        List<KeyResult> keyResults = keyResultRepository.findByObjectiveId(objectiveId);
        if (keyResults.isEmpty()) {
            objective.setProgress(BigDecimal.valueOf(0));
        } else {
            double totalProgress = keyResults.stream()
                .mapToDouble(kr -> keyResultService.calculateProgressPercentage(kr).doubleValue())
                .sum();
            double averageProgress = totalProgress / keyResults.size();
            objective.setProgress(BigDecimal.valueOf((int) Math.round(averageProgress)));
        }
        
        objectiveRepository.save(objective);
    }
}



