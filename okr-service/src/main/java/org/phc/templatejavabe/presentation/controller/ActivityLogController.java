package org.phc.templatejavabe.presentation.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/activity-log")
public class ActivityLogController {

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getActivityLog(
            @RequestParam(required = false) String type,
            @RequestParam(required = false, defaultValue = "50") int limit) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return ResponseEntity.status(401).body(List.of());
        }

        // Mock activity data for now
        List<Map<String, Object>> activities = List.of(
            Map.of(
                "id", "act_001",
                "type", "objective_created",
                "title", "New objective created",
                "description", "Created objective: Increase customer satisfaction",
                "user_id", auth.getName(),
                "user_name", "John Doe",
                "created_date", Instant.now().toString(),
                "metadata", Map.of("objective_id", "obj_001")
            ),
            Map.of(
                "id", "act_002", 
                "type", "key_result_created",
                "title", "Key result added",
                "description", "Added key result: Achieve 90% customer satisfaction score",
                "user_id", auth.getName(),
                "user_name", "John Doe", 
                "created_date", Instant.now().minusSeconds(3600).toString(),
                "metadata", Map.of("key_result_id", "kr_001")
            ),
            Map.of(
                "id", "act_003",
                "type", "check_in",
                "title", "Progress check-in",
                "description", "Updated progress to 75%",
                "user_id", auth.getName(),
                "user_name", "John Doe",
                "created_date", Instant.now().minusSeconds(7200).toString(),
                "metadata", Map.of("check_in_id", "ci_001")
            ),
            Map.of(
                "id", "act_004",
                "type", "comment",
                "title", "Comment added",
                "description", "Added comment: Great progress this quarter!",
                "user_id", auth.getName(),
                "user_name", "John Doe",
                "created_date", Instant.now().minusSeconds(10800).toString(),
                "metadata", Map.of("comment_id", "com_001")
            )
        );

        // Filter by type if specified
        if (type != null && !type.equals("all")) {
            activities = activities.stream()
                .filter(activity -> activity.get("type").equals(type))
                .toList();
        }

        return ResponseEntity.ok(activities);
    }
}

