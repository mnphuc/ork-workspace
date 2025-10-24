package org.phc.templatejavabe.presentation.controller;

import jakarta.validation.Valid;
import org.phc.templatejavabe.domain.model.User;
import org.phc.templatejavabe.domain.service.UserService;
import org.phc.templatejavabe.presentation.request.auth.LoginRequest;
import org.phc.templatejavabe.presentation.request.auth.RefreshRequest;
import org.phc.templatejavabe.presentation.request.auth.RegisterRequest;
import org.phc.templatejavabe.presentation.response.auth.TokenResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    
    @Autowired
    private MessageSource messageSource;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            TokenResponse response = userService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            Locale locale = LocaleContextHolder.getLocale();
            User user = userService.register(request);
            return ResponseEntity.ok(Map.of(
                "message", messageSource.getMessage("auth.register.success", null, locale),
                "user_id", user.getId()
            ));
        } catch (RuntimeException e) {
            Locale locale = LocaleContextHolder.getLocale();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "Unauthorized",
                "message", "User not authenticated",
                "timestamp", java.time.Instant.now().toString()
            ));
        }

        String userId = auth.getName();
        return userService.findById(userId)
            .map(user -> {
                Map<String, Object> userInfo = Map.of(
                    "id", user.getId(),
                    "email", user.getEmail(),
                    "full_name", user.getFullName(),
                    "avatar_url", user.getAvatarUrl() != null ? user.getAvatarUrl() : "",
                    "status", user.getStatus().toString()
                );
                return ResponseEntity.ok(userInfo);
            })
            .orElse(ResponseEntity.status(404).body(Map.of(
                "error", "Not Found",
                "message", "User not found",
                "timestamp", java.time.Instant.now().toString()
            )));
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refreshToken(@Valid @RequestBody RefreshRequest request) {
        try {
            TokenResponse response = userService.refreshToken(request.refreshToken());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).build();
        }
    }
}