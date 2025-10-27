package org.phc.templatejavabe.domain.service;

import org.phc.templatejavabe.domain.model.User;
import org.phc.templatejavabe.domain.repository.UserRepository;
import org.phc.templatejavabe.infrastructure.config.JwtUtil;
import org.phc.templatejavabe.presentation.request.auth.LoginRequest;
import org.phc.templatejavabe.presentation.request.auth.RegisterRequest;
import org.phc.templatejavabe.presentation.response.auth.TokenResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final IdGeneratorService idGeneratorService;

    public UserService(UserRepository userRepository, 
                      PasswordEncoder passwordEncoder, 
                      JwtUtil jwtUtil,
                      IdGeneratorService idGeneratorService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.idGeneratorService = idGeneratorService;
    }

    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public TokenResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.email());
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid email or password");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (user.getStatus() != User.UserStatus.ACTIVE) {
            throw new RuntimeException("Account is not active");
        }

        String accessToken = jwtUtil.generateAccessToken(user.getId());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());

        return new TokenResponse(accessToken, refreshToken);
    }

    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already exists");
        }

        String userId = idGeneratorService.generateId();
        String hashedPassword = passwordEncoder.encode(request.password());

        User user = new User(userId, request.email(), hashedPassword, request.fullName());
        return userRepository.save(user);
    }

    public TokenResponse refreshToken(String refreshToken) {
        try {
            String userId = jwtUtil.extractUserIdFromRefreshToken(refreshToken);
            Optional<User> userOpt = userRepository.findById(userId);
            
            if (userOpt.isEmpty() || userOpt.get().getStatus() != User.UserStatus.ACTIVE) {
                throw new RuntimeException("Invalid refresh token");
            }

            String newAccessToken = jwtUtil.generateAccessToken(userId);
            String newRefreshToken = jwtUtil.generateRefreshToken(userId);

            return new TokenResponse(newAccessToken, newRefreshToken);
        } catch (Exception e) {
            throw new RuntimeException("Invalid refresh token");
        }
    }

    public User updateUser(String userId, Map<String, Object> updateData) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();
        
        // Update fields if provided
        if (updateData.containsKey("full_name")) {
            user.setFullName((String) updateData.get("full_name"));
        }
        if (updateData.containsKey("avatar_url")) {
            user.setAvatarUrl((String) updateData.get("avatar_url"));
        }
        
        return userRepository.save(user);
    }
}