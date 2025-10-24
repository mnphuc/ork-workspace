package org.phc.templatejavabe.domain.service;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.phc.templatejavabe.domain.model.User;
import org.phc.templatejavabe.infrastructure.config.JwtUtil;
import org.phc.templatejavabe.domain.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public User register(String email, String rawPassword, String fullName) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email đã tồn tại");
        }
        User u = new User();
        u.setEmail(email);
        u.setPasswordHash(passwordEncoder.encode(rawPassword));
        u.setFullName(fullName);
        u.setStatus(User.UserStatus.ACTIVE);
        return userRepository.save(u);
    }

    public String[] login(String email, String rawPassword) {
        User u = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("Sai email hoặc mật khẩu"));
        if (u.getPasswordHash() == null || !passwordEncoder.matches(rawPassword, u.getPasswordHash())) {
            throw new IllegalArgumentException("Sai email hoặc mật khẩu");
        }
        String access = jwtUtil.generateAccessToken(u.getId(), Map.of("email", u.getEmail(), "name", u.getFullName()));
        String refresh = jwtUtil.generateRefreshToken(u.getId());
        return new String[] { access, refresh };
    }

    public java.util.Optional<User> getById(String id) {
        return userRepository.findById(id);
    }
}


