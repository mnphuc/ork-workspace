package org.phc.templatejavabe.domain.service;

import org.phc.templatejavabe.domain.model.Interval;
import org.phc.templatejavabe.infrastructure.repository.IntervalRepository;
import org.phc.templatejavabe.presentation.request.interval.*;
import org.phc.templatejavabe.presentation.response.interval.*;
import org.phc.templatejavabe.application.mapper.IntervalMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class IntervalService {

    private static final Logger logger = LoggerFactory.getLogger(IntervalService.class);

    @Autowired
    private IntervalRepository intervalRepository;

    public IntervalResponse createInterval(CreateIntervalRequest request, String userId) {
        logger.info("Creating interval: {} for workspace: {} by user: {}", request.getName(), request.getWorkspaceId(), userId);

        // Check if interval name already exists in workspace
        if (intervalRepository.existsByNameAndWorkspaceId(request.getName(), request.getWorkspaceId())) {
            throw new RuntimeException("Interval with name '" + request.getName() + "' already exists in this workspace");
        }

        // Parse dates
        LocalDate startDate = LocalDate.parse(request.getStartDate());
        LocalDate endDate = LocalDate.parse(request.getEndDate());

        // Validate date range
        if (startDate.isAfter(endDate)) {
            throw new RuntimeException("Start date cannot be after end date");
        }

        // If this is set as active, deactivate other active intervals in the same workspace
        if (request.getIsActive()) {
            List<Interval> activeIntervals = intervalRepository.findActiveIntervalsByWorkspace(request.getWorkspaceId());
            for (Interval activeInterval : activeIntervals) {
                activeInterval.deactivate();
                intervalRepository.save(activeInterval);
            }
        }

        // Create interval
        Interval interval = new Interval();
        interval.setId(generateId());
        interval.setName(request.getName());
        interval.setDescription(request.getDescription());
        interval.setWorkspaceId(request.getWorkspaceId());
        interval.setIntervalType(request.getIntervalType());
        interval.setStartDate(startDate);
        interval.setEndDate(endDate);
        interval.setIsActive(request.getIsActive());
        interval.setSettings(request.getSettings());
        interval.setStatus("ACTIVE");
        interval.setCreatedBy(userId);
        interval.setOwnerId(userId);

        Interval savedInterval = intervalRepository.save(interval);
        logger.info("Interval created successfully: {}", savedInterval.getId());

        return IntervalMapper.toResponse(savedInterval);
    }

    public List<IntervalResponse> getIntervals(String workspaceId, String userId) {
        logger.info("Getting intervals for workspace: {} by user: {}", workspaceId, userId);

        List<Interval> intervals;
        if (workspaceId != null) {
            intervals = intervalRepository.findByWorkspaceIdAndStatusOrderByStartDateDesc(workspaceId, "ACTIVE");
        } else {
            intervals = intervalRepository.findActiveIntervalsByOwner(userId);
        }

        return intervals.stream()
                .map(IntervalMapper::toResponse)
                .collect(Collectors.toList());
    }

    public IntervalResponse getInterval(String id, String userId) {
        logger.info("Getting interval: {} by user: {}", id, userId);

        Interval interval = intervalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interval not found"));

        // Check if user has access to this interval's workspace
        // This would typically involve checking workspace membership
        // For now, we'll just return the interval

        return IntervalMapper.toResponse(interval);
    }

    public IntervalResponse updateInterval(String id, UpdateIntervalRequest request, String userId) {
        logger.info("Updating interval: {} by user: {}", id, userId);

        Interval interval = intervalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interval not found"));

        // Check if user has permission to update this interval
        if (!interval.getOwnerId().equals(userId)) {
            throw new RuntimeException("You don't have permission to update this interval");
        }

        // Update fields
        if (request.getName() != null) {
            // Check if new name already exists in workspace
            if (!request.getName().equals(interval.getName()) && 
                intervalRepository.existsByNameAndWorkspaceId(request.getName(), interval.getWorkspaceId())) {
                throw new RuntimeException("Interval with name '" + request.getName() + "' already exists in this workspace");
            }
            interval.setName(request.getName());
        }
        if (request.getDescription() != null) {
            interval.setDescription(request.getDescription());
        }
        if (request.getIntervalType() != null) {
            interval.setIntervalType(request.getIntervalType());
        }
        if (request.getStartDate() != null) {
            interval.setStartDate(LocalDate.parse(request.getStartDate()));
        }
        if (request.getEndDate() != null) {
            interval.setEndDate(LocalDate.parse(request.getEndDate()));
        }
        if (request.getSettings() != null) {
            interval.setSettings(request.getSettings());
        }
        if (request.getIsActive() != null) {
            // If activating this interval, deactivate others in the same workspace
            if (request.getIsActive() && !interval.getIsActive()) {
                List<Interval> activeIntervals = intervalRepository.findActiveIntervalsByWorkspace(interval.getWorkspaceId());
                for (Interval activeInterval : activeIntervals) {
                    if (!activeInterval.getId().equals(id)) {
                        activeInterval.deactivate();
                        intervalRepository.save(activeInterval);
                    }
                }
            }
            interval.setIsActive(request.getIsActive());
        }
        interval.setLastModifiedBy(userId);

        Interval updatedInterval = intervalRepository.save(interval);
        logger.info("Interval updated successfully: {}", id);

        return IntervalMapper.toResponse(updatedInterval);
    }

    public void deleteInterval(String id, String userId) {
        logger.info("Deleting interval: {} by user: {}", id, userId);

        Interval interval = intervalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interval not found"));

        // Check if user has permission to delete this interval
        if (!interval.getOwnerId().equals(userId)) {
            throw new RuntimeException("You don't have permission to delete this interval");
        }

        // Soft delete
        interval.setStatus("DELETED");
        interval.setLastModifiedBy(userId);
        intervalRepository.save(interval);

        logger.info("Interval deleted successfully: {}", id);
    }

    public IntervalResponse activateInterval(String id, String userId) {
        logger.info("Activating interval: {} by user: {}", id, userId);

        Interval interval = intervalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interval not found"));

        // Check if user has permission to activate this interval
        if (!interval.getOwnerId().equals(userId)) {
            throw new RuntimeException("You don't have permission to activate this interval");
        }

        // Deactivate other active intervals in the same workspace
        List<Interval> activeIntervals = intervalRepository.findActiveIntervalsByWorkspace(interval.getWorkspaceId());
        for (Interval activeInterval : activeIntervals) {
            if (!activeInterval.getId().equals(id)) {
                activeInterval.deactivate();
                intervalRepository.save(activeInterval);
            }
        }

        // Activate this interval
        interval.activate();
        interval.setLastModifiedBy(userId);
        Interval updatedInterval = intervalRepository.save(interval);

        logger.info("Interval activated successfully: {}", id);
        return IntervalMapper.toResponse(updatedInterval);
    }

    public IntervalResponse deactivateInterval(String id, String userId) {
        logger.info("Deactivating interval: {} by user: {}", id, userId);

        Interval interval = intervalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interval not found"));

        // Check if user has permission to deactivate this interval
        if (!interval.getOwnerId().equals(userId)) {
            throw new RuntimeException("You don't have permission to deactivate this interval");
        }

        // Deactivate this interval
        interval.deactivate();
        interval.setLastModifiedBy(userId);
        Interval updatedInterval = intervalRepository.save(interval);

        logger.info("Interval deactivated successfully: {}", id);
        return IntervalMapper.toResponse(updatedInterval);
    }

    public List<IntervalResponse> getActiveIntervals(String workspaceId, String userId) {
        logger.info("Getting active intervals for workspace: {} by user: {}", workspaceId, userId);

        List<Interval> intervals = intervalRepository.findActiveIntervalsByWorkspace(workspaceId);

        return intervals.stream()
                .map(IntervalMapper::toResponse)
                .collect(Collectors.toList());
    }

    private String generateId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 26);
    }
}


