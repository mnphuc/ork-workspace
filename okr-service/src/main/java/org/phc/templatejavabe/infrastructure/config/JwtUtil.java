package org.phc.templatejavabe.infrastructure.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {
    private final JwtProperties props;
    private final Key key;

    public JwtUtil(JwtProperties props) {
        this.props = props;
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(props.getSecret()));
    }

    public String generateAccessToken(String subject) {
        return generateToken(subject, Map.of("type", "access"), props.getAccessTtlSeconds());
    }

    public String generateAccessToken(String subject, Map<String, Object> claims) {
        return generateToken(subject, claims, props.getAccessTtlSeconds());
    }

    public String generateRefreshToken(String subject) {
        return generateToken(subject, Map.of("type", "refresh"), props.getRefreshTtlSeconds());
    }

    public String extractUserIdFromRefreshToken(String token) {
        Claims claims = parseClaims(token);
        if (!isRefreshToken(claims)) {
            throw new RuntimeException("Invalid refresh token");
        }
        return claims.getSubject();
    }

    private String generateToken(String subject, Map<String, Object> claims, long ttlSeconds) {
        Instant now = Instant.now();
        return Jwts.builder()
            .setSubject(subject)
            .setIssuedAt(Date.from(now))
            .setExpiration(Date.from(now.plusSeconds(ttlSeconds)))
            .addClaims(claims)
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
    }

    public boolean isRefreshToken(Claims claims) {
        Object type = claims.get("type");
        return type != null && "refresh".equals(type.toString());
    }
}


