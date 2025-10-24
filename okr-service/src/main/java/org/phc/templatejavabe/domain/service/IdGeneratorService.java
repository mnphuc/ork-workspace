package org.phc.templatejavabe.domain.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;

@Service
public class IdGeneratorService {
    
    private static final String ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    private static final int ID_LENGTH = 26;
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Generate a ULID-like ID (26 characters)
     * Format: TTTTTTTTTTRRRRRRRRRRRRRRRR
     * T = Timestamp (10 chars)
     * R = Random (16 chars)
     */
    public String generateId() {
        long timestamp = Instant.now().toEpochMilli();
        
        // Convert timestamp to base32
        StringBuilder id = new StringBuilder();
        
        // Timestamp part (10 characters)
        long temp = timestamp;
        for (int i = 0; i < 10; i++) {
            id.insert(0, ALPHABET.charAt((int) (temp % 32)));
            temp /= 32;
        }
        
        // Random part (16 characters)
        for (int i = 0; i < 16; i++) {
            id.append(ALPHABET.charAt(RANDOM.nextInt(32)));
        }
        
        return id.toString();
    }
}
