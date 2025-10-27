package org.phc.templatejavabe.presentation.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/settings")
public class SettingsController {

    @GetMapping("/notifications")
    public ResponseEntity<Map<String, Object>> getNotificationSettings() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "Unauthorized",
                "message", "User not authenticated"
            ));
        }

        // Return default notification settings
        Map<String, Object> settings = Map.of(
            "objective_updates", Map.of(
                "enabled", true,
                "frequency", "daily"
            ),
            "check_in_reminders", Map.of(
                "enabled", true,
                "frequency", "weekly"
            ),
            "team_mentions", Map.of(
                "enabled", true,
                "frequency", "immediate"
            )
        );

        return ResponseEntity.ok(settings);
    }

    @PutMapping("/notifications")
    public ResponseEntity<Map<String, Object>> updateNotificationSettings(@RequestBody Map<String, Object> settings) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "Unauthorized",
                "message", "User not authenticated"
            ));
        }

        try {
            // In a real implementation, you would save these settings to the database
            // For now, we'll just return success
            return ResponseEntity.ok(Map.of(
                "message", "Notification settings updated successfully",
                "settings", settings
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to update settings",
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/preferences")
    public ResponseEntity<Map<String, Object>> getUserPreferences() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "Unauthorized",
                "message", "User not authenticated"
            ));
        }

        // Return default user preferences
        Map<String, Object> preferences = Map.of(
            "language", "en",
            "timezone", "UTC",
            "date_format", "MM/dd/yyyy",
            "theme", "light"
        );

        return ResponseEntity.ok(preferences);
    }

    @PutMapping("/preferences")
    public ResponseEntity<Map<String, Object>> updateUserPreferences(@RequestBody Map<String, Object> preferences) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "Unauthorized",
                "message", "User not authenticated"
            ));
        }

        try {
            // In a real implementation, you would save these preferences to the database
            // For now, we'll just return success
            return ResponseEntity.ok(Map.of(
                "message", "User preferences updated successfully",
                "preferences", preferences
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to update preferences",
                "message", e.getMessage()
            ));
        }
    }
}

