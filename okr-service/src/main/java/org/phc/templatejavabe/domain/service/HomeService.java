package org.phc.templatejavabe.domain.service;

import org.phc.templatejavabe.domain.model.CheckIn;
import org.phc.templatejavabe.domain.model.KeyResult;
import org.phc.templatejavabe.domain.model.Objective;
import org.phc.templatejavabe.domain.model.ObjectiveStatus;
import org.phc.templatejavabe.domain.model.Team;
import org.phc.templatejavabe.infrastructure.repository.CheckInRepository;
import org.phc.templatejavabe.infrastructure.repository.KeyResultRepository;
import org.phc.templatejavabe.infrastructure.repository.ObjectiveRepository;
import org.phc.templatejavabe.infrastructure.repository.TeamRepository;
import org.phc.templatejavabe.presentation.response.home.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HomeService {
    private static final Logger logger = LoggerFactory.getLogger(HomeService.class);
    
    private final ObjectiveRepository objectiveRepository;
    private final KeyResultRepository keyResultRepository;
    private final CheckInRepository checkInRepository;
    private final TeamRepository teamRepository;

    public HomeService(ObjectiveRepository objectiveRepository, 
                      KeyResultRepository keyResultRepository,
                      CheckInRepository checkInRepository,
                      TeamRepository teamRepository) {
        this.objectiveRepository = objectiveRepository;
        this.keyResultRepository = keyResultRepository;
        this.checkInRepository = checkInRepository;
        this.teamRepository = teamRepository;
    }

    /**
     * Get home summary data for a user
     */
    public HomeSummaryResponse getHomeSummary(String userId) {
        logger.info("Getting home summary for userId: {}", userId);
        
        try {
            // Get current quarter (simplified - using Q1 2024 as default)
            String currentQuarter = "Q1 2024";
            logger.debug("Using quarter: {}", currentQuarter);
            
            // Get user's objectives for current quarter
            logger.debug("Fetching objectives for user: {} and quarter: {}", userId, currentQuarter);
            List<Objective> objectives = objectiveRepository.findByOwnerIdAndQuarter(userId, currentQuarter);
            logger.info("Found {} objectives for user: {}", objectives.size(), userId);
            
            // Calculate personal progress (average of objectives progress)
            int personalProgress = calculateAverageProgress(objectives);
            logger.debug("Calculated personal progress: {}%", personalProgress);
            
            // Calculate metrics progress (average of all key results progress)
            int metricsProgress = calculateMetricsProgress(objectives);
            logger.debug("Calculated metrics progress: {}%", metricsProgress);
            
            // Calculate last week change (simplified - return 0 for now)
            int lastWeekChange = 0;
            
            // Calculate status distribution
            StatusDistributionResponse statusDistribution = calculateStatusDistribution(objectives);
            logger.debug("Status distribution: {}", statusDistribution);
            
            HomeSummaryResponse response = new HomeSummaryResponse(
                personalProgress,
                metricsProgress,
                lastWeekChange,
                statusDistribution
            );
            
            logger.info("Successfully created home summary for user: {}", userId);
            return response;
            
        } catch (Exception e) {
            logger.error("Error getting home summary for user: {}", userId, e);
            throw new RuntimeException("Failed to get home summary: " + e.getMessage(), e);
        }
    }

    /**
     * Get personal objectives for a user
     */
    public List<PersonalObjectiveResponse> getPersonalObjectives(String userId) {
        logger.info("Getting personal objectives for userId: {}", userId);
        
        try {
            String currentQuarter = "Q1 2024";
            logger.debug("Fetching objectives for user: {} and quarter: {}", userId, currentQuarter);
            List<Objective> objectives = objectiveRepository.findByOwnerIdAndQuarter(userId, currentQuarter);
            logger.info("Found {} objectives for user: {}", objectives.size(), userId);
            
            List<PersonalObjectiveResponse> response = objectives.stream()
                .map(this::mapToPersonalObjectiveResponse)
                .collect(Collectors.toList());
            
            logger.info("Successfully mapped {} personal objectives for user: {}", response.size(), userId);
            return response;
            
        } catch (Exception e) {
            logger.error("Error getting personal objectives for user: {}", userId, e);
            throw new RuntimeException("Failed to get personal objectives: " + e.getMessage(), e);
        }
    }

    /**
     * Get groups information for a user
     */
    public List<GroupInfoResponse> getUserGroups(String userId) {
        logger.info("Getting user groups for userId: {}", userId);
        
        try {
            // For now, get teams where user is manager
            // In a real implementation, you'd have a team_members table
            logger.debug("Fetching teams where user is manager: {}", userId);
            List<Team> teams = teamRepository.findByManagerId(userId);
            logger.info("Found {} teams for user: {}", teams.size(), userId);
            
            List<GroupInfoResponse> response = teams.stream()
                .map(team -> mapToGroupInfoResponse(team))
                .collect(Collectors.toList());
            
            logger.info("Successfully mapped {} groups for user: {}", response.size(), userId);
            return response;
            
        } catch (Exception e) {
            logger.error("Error getting user groups for user: {}", userId, e);
            throw new RuntimeException("Failed to get user groups: " + e.getMessage(), e);
        }
    }

    private int calculateAverageProgress(List<Objective> objectives) {
        logger.debug("Calculating average progress for {} objectives", objectives.size());
        
        if (objectives.isEmpty()) {
            logger.debug("No objectives found, returning 0% progress");
            return 0;
        }
        
        BigDecimal totalProgress = objectives.stream()
            .filter(obj -> obj.getProgress() != null)
            .map(Objective::getProgress)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        int result = totalProgress.divide(BigDecimal.valueOf(objectives.size()), 0, java.math.RoundingMode.HALF_UP).intValue();
        logger.debug("Average progress calculated: {}%", result);
        return result;
    }

    private int calculateMetricsProgress(List<Objective> objectives) {
        logger.debug("Calculating metrics progress for {} objectives", objectives.size());
        
        if (objectives.isEmpty()) {
            logger.debug("No objectives found, returning 0% metrics progress");
            return 0;
        }
        
        List<KeyResult> allKeyResults = objectives.stream()
            .map(obj -> {
                logger.debug("Fetching key results for objective: {}", obj.getId());
                return keyResultRepository.findByObjectiveId(obj.getId());
            })
            .flatMap(List::stream)
            .collect(Collectors.toList());
        
        logger.debug("Found {} key results across all objectives", allKeyResults.size());
        
        if (allKeyResults.isEmpty()) {
            logger.debug("No key results found, returning 0% metrics progress");
            return 0;
        }
        
        // Calculate average progress of key results
        BigDecimal totalProgress = allKeyResults.stream()
            .filter(kr -> kr.getCurrentValue() != null && kr.getTargetValue() != null && kr.getTargetValue().compareTo(BigDecimal.ZERO) > 0)
            .map(kr -> {
                BigDecimal progress = kr.getCurrentValue().divide(kr.getTargetValue(), 4, java.math.RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
                logger.debug("Key result {} progress: {}%", kr.getId(), progress);
                return progress;
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        int result = totalProgress.divide(BigDecimal.valueOf(allKeyResults.size()), 0, java.math.RoundingMode.HALF_UP).intValue();
        logger.debug("Metrics progress calculated: {}%", result);
        return result;
    }

    private StatusDistributionResponse calculateStatusDistribution(List<Objective> objectives) {
        logger.debug("Calculating status distribution for {} objectives", objectives.size());
        
        Map<ObjectiveStatus, Long> statusCounts = objectives.stream()
            .filter(obj -> obj.getStatus() != null)
            .collect(Collectors.groupingBy(Objective::getStatus, Collectors.counting()));
        
        StatusDistributionResponse response = new StatusDistributionResponse(
            statusCounts.getOrDefault(ObjectiveStatus.NOT_STARTED, 0L).intValue(),
            statusCounts.getOrDefault(ObjectiveStatus.AT_RISK, 0L).intValue(),
            statusCounts.getOrDefault(ObjectiveStatus.BEHIND, 0L).intValue(),
            statusCounts.getOrDefault(ObjectiveStatus.ON_TRACK, 0L).intValue(),
            statusCounts.getOrDefault(ObjectiveStatus.CLOSED, 0L).intValue(),
            statusCounts.getOrDefault(ObjectiveStatus.ABANDONED, 0L).intValue()
        );
        
        logger.debug("Status distribution calculated: {}", response);
        return response;
    }

    private PersonalObjectiveResponse mapToPersonalObjectiveResponse(Objective objective) {
        logger.debug("Mapping objective to PersonalObjectiveResponse: {}", objective.getId());
        
        try {
            // Get last check-in date for this objective
            String lastCheckIn = getLastCheckInForObjective(objective.getId());
            
            // Format due date
            String dueDate = objective.getEndDate() != null ? 
                objective.getEndDate().format(DateTimeFormatter.ISO_LOCAL_DATE) : null;
            
            PersonalObjectiveResponse response = new PersonalObjectiveResponse(
                objective.getId(),
                objective.getTitle(),
                objective.getProgress() != null ? objective.getProgress().intValue() : 0,
                objective.getStatus() != null ? objective.getStatus().name() : "NOT_STARTED",
                lastCheckIn,
                dueDate,
                objective.getOwnerId()
            );
            
            logger.debug("Successfully mapped objective: {}", objective.getId());
            return response;
            
        } catch (Exception e) {
            logger.error("Error mapping objective to PersonalObjectiveResponse: {}", objective.getId(), e);
            throw new RuntimeException("Failed to map objective: " + e.getMessage(), e);
        }
    }

    private String getLastCheckInForObjective(String objectiveId) {
        logger.debug("Getting last check-in for objective: {}", objectiveId);
        
        try {
            // Get all key results for this objective
            List<KeyResult> keyResults = keyResultRepository.findByObjectiveId(objectiveId);
            logger.debug("Found {} key results for objective: {}", keyResults.size(), objectiveId);
            
            if (keyResults.isEmpty()) {
                logger.debug("No key results found for objective: {}", objectiveId);
                return null;
            }
            
            // Find the most recent check-in across all key results
            Optional<CheckIn> lastCheckIn = keyResults.stream()
                .map(kr -> {
                    logger.debug("Fetching check-ins for key result: {}", kr.getId());
                    return checkInRepository.findByKeyResultIdOrderByCreatedDateDesc(kr.getId());
                })
                .flatMap(List::stream)
                .max(Comparator.comparing(CheckIn::getCreatedDate));
            
            String result = lastCheckIn.map(checkIn -> {
                logger.debug("Found last check-in: {} for objective: {}", checkIn.getId(), objectiveId);
                return checkIn.getCreatedDate().toString();
            }).orElse(null);
            
            logger.debug("Last check-in for objective {}: {}", objectiveId, result);
            return result;
            
        } catch (Exception e) {
            logger.error("Error getting last check-in for objective: {}", objectiveId, e);
            return null; // Return null instead of throwing to avoid breaking the whole request
        }
    }

    private GroupInfoResponse mapToGroupInfoResponse(Team team) {
        logger.debug("Mapping team to GroupInfoResponse: {}", team.getId());
        
        try {
            String currentQuarter = "Q1 2024";
            
            // Get objectives for this team
            logger.debug("Fetching objectives for team: {} and quarter: {}", team.getId(), currentQuarter);
            List<Objective> teamObjectives = objectiveRepository.findByTeamIdAndQuarter(team.getId(), currentQuarter);
            logger.debug("Found {} objectives for team: {}", teamObjectives.size(), team.getId());
            
            // Count objectives
            int objectivesCount = teamObjectives.size();
            
            // Count metrics (key results)
            int metricsCount = teamObjectives.stream()
                .mapToInt(obj -> {
                    List<KeyResult> keyResults = keyResultRepository.findByObjectiveId(obj.getId());
                    logger.debug("Found {} key results for objective: {}", keyResults.size(), obj.getId());
                    return keyResults.size();
                })
                .sum();
            
            logger.debug("Total metrics count for team {}: {}", team.getId(), metricsCount);
            
            // Calculate average objectives progress
            int avgObjectivesProgress = calculateAverageProgress(teamObjectives);
            
            // Calculate average metrics progress
            int avgMetricsProgress = calculateMetricsProgress(teamObjectives);
            
            GroupInfoResponse response = new GroupInfoResponse(
                team.getId(),
                team.getName(),
                objectivesCount,
                metricsCount,
                avgObjectivesProgress,
                avgMetricsProgress
            );
            
            logger.debug("Successfully mapped team: {}", team.getId());
            return response;
            
        } catch (Exception e) {
            logger.error("Error mapping team to GroupInfoResponse: {}", team.getId(), e);
            throw new RuntimeException("Failed to map team: " + e.getMessage(), e);
        }
    }
}
