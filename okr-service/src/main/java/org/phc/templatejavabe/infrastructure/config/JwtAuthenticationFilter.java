package org.phc.templatejavabe.infrastructure.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.IOException;
import java.security.Key;
import java.util.Collections;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final Key key;

    public JwtAuthenticationFilter(JwtProperties props) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(props.getSecret()));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
        
        String requestURI = request.getRequestURI();
        logger.debug("Processing request: {} {}", request.getMethod(), requestURI);
        
        String authHeader = request.getHeader("Authorization");
        logger.debug("Authorization header: {}", authHeader != null ? "Present" : "Missing");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            logger.debug("Extracted token: {}...", token.substring(0, Math.min(20, token.length())));
            
            try {
                Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
                String userId = claims.getSubject();
                logger.debug("Token parsed successfully for user: {}", userId);
                
                var auth = new UsernamePasswordAuthenticationToken(userId, null, Collections.emptyList());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
                
                logger.debug("Authentication set for user: {}", userId);
            } catch (Exception e) {
                logger.warn("JWT token validation failed for request: {} - Error: {}", requestURI, e.getMessage());
                // Don't set authentication, let Spring Security handle it
            }
        } else {
            logger.debug("No valid Authorization header found for request: {}", requestURI);
        }
        
        filterChain.doFilter(request, response);
    }
}




