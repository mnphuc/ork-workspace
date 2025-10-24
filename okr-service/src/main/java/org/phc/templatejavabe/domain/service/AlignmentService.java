package org.phc.templatejavabe.domain.service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;
import org.phc.templatejavabe.domain.model.ObjectiveAlignment;
import org.phc.templatejavabe.domain.model.ObjectiveAlignmentId;
import org.phc.templatejavabe.infrastructure.repository.ObjectiveAlignmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AlignmentService {
    private final ObjectiveAlignmentRepository repo;

    public AlignmentService(ObjectiveAlignmentRepository repo) {
        this.repo = repo;
    }

    public List<ObjectiveAlignment> listParents(String parentObjectiveId) {
        return repo.findByIdParentObjectiveId(parentObjectiveId);
    }

    public List<ObjectiveAlignment> listChildren(String childObjectiveId) {
        return repo.findByIdChildObjectiveId(childObjectiveId);
    }

    /**
     * Get alignment tree starting from root objective
     */
    public List<Map<String, Object>> getAlignmentTree(String rootObjectiveId) {
        List<ObjectiveAlignment> alignments = repo.findByIdParentObjectiveId(rootObjectiveId);
        
        return alignments.stream()
            .map(alignment -> {
                Map<String, Object> node = new HashMap<>();
                node.put("parent_id", alignment.getId().getParentObjectiveId());
                node.put("child_id", alignment.getId().getChildObjectiveId());
                node.put("children", getAlignmentTree(alignment.getId().getChildObjectiveId()));
                return node;
            })
            .collect(Collectors.toList());
    }

    @Transactional
    public ObjectiveAlignment align(String parentObjectiveId, String childObjectiveId) {
        // Validate no circular dependency
        validateAlignment(parentObjectiveId, childObjectiveId);
        
        ObjectiveAlignment a = new ObjectiveAlignment();
        a.setId(new ObjectiveAlignmentId(parentObjectiveId, childObjectiveId));
        return repo.save(a);
    }

    @Transactional
    public void deleteAlignment(String parentObjectiveId, String childObjectiveId) {
        ObjectiveAlignmentId id = new ObjectiveAlignmentId(parentObjectiveId, childObjectiveId);
        repo.deleteById(id);
    }

    /**
     * Validate that alignment doesn't create circular dependency
     */
    public void validateAlignment(String parentObjectiveId, String childObjectiveId) {
        if (parentObjectiveId.equals(childObjectiveId)) {
            throw new IllegalArgumentException("Không thể align objective với chính nó");
        }

        // Check if child is already a parent of the proposed parent (circular dependency)
        if (wouldCreateCircularDependency(parentObjectiveId, childObjectiveId)) {
            throw new IllegalArgumentException("Alignment này sẽ tạo ra circular dependency");
        }
    }

    /**
     * Check if adding this alignment would create a circular dependency
     */
    private boolean wouldCreateCircularDependency(String parentObjectiveId, String childObjectiveId) {
        Set<String> visited = new HashSet<>();
        return hasPath(childObjectiveId, parentObjectiveId, visited);
    }

    /**
     * Check if there's a path from start to target using DFS
     */
    private boolean hasPath(String start, String target, Set<String> visited) {
        if (start.equals(target)) {
            return true;
        }

        if (visited.contains(start)) {
            return false;
        }

        visited.add(start);

        List<ObjectiveAlignment> children = repo.findByIdParentObjectiveId(start);
        for (ObjectiveAlignment alignment : children) {
            if (hasPath(alignment.getId().getChildObjectiveId(), target, visited)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get all parent objectives for a given objective
     */
    public List<String> getParents(String objectiveId) {
        return repo.findByIdChildObjectiveId(objectiveId)
            .stream()
            .map(alignment -> alignment.getId().getParentObjectiveId())
            .collect(Collectors.toList());
    }

    /**
     * Get all child objectives for a given objective
     */
    public List<String> getChildren(String objectiveId) {
        return repo.findByIdParentObjectiveId(objectiveId)
            .stream()
            .map(alignment -> alignment.getId().getChildObjectiveId())
            .collect(Collectors.toList());
    }
}



