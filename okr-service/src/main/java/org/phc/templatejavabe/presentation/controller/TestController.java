package org.phc.templatejavabe.presentation.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/password")
    public String testPassword() {
        String password = "password";
        String existingHash = "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi";
        
        boolean matches = passwordEncoder.matches(password, existingHash);
        
        return "Password 'password' matches existing hash: " + matches + "\n" +
               "Existing hash: " + existingHash + "\n" +
               "New hash for 'password': " + passwordEncoder.encode(password);
    }
}