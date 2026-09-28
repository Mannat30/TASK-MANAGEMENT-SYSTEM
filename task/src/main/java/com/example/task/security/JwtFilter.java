package com.example.task.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getServletPath();

        System.out.println("================================");
        System.out.println("REQUEST: " + request.getMethod() + " " + path);

        // ==========================================
        // PUBLIC AUTH ENDPOINTS
        // ==========================================

        if (path.equals("/api/auth/login")
                || path.equals("/api/auth/register")) {

            System.out.println("PUBLIC AUTH ENDPOINT - JWT NOT REQUIRED");

            filterChain.doFilter(request, response);
            return;
        }

        // ==========================================
        // GET AUTHORIZATION HEADER
        // ==========================================

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {

            System.out.println("AUTH HEADER: NOT PRESENT");

            filterChain.doFilter(request, response);
            return;
        }

        System.out.println("AUTH HEADER: PRESENT");

        String token = authHeader.substring(7);

        if (token.isBlank()) {

            System.out.println("JWT: EMPTY TOKEN");

            filterChain.doFilter(request, response);
            return;
        }

        // ==========================================
        // VALIDATE JWT
        // ==========================================

        try {

            if (!jwtService.isTokenValid(token)) {

                System.out.println("JWT: INVALID TOKEN");

                filterChain.doFilter(request, response);
                return;
            }

            String email = jwtService.extractEmail(token);
            String role = jwtService.extractRole(token);

            System.out.println("JWT: VALID");
            System.out.println("JWT EMAIL: " + email);
            System.out.println("JWT ROLE: " + role);

            SimpleGrantedAuthority authority =
                    new SimpleGrantedAuthority("ROLE_" + role);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            Collections.singletonList(authority)
                    );

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);

            System.out.println(
                    "AUTHORITY: " + authority.getAuthority()
            );

        } catch (Exception e) {

            System.out.println(
                    "JWT FILTER ERROR: " + e.getMessage()
            );

            SecurityContextHolder.clearContext();
        }

        // ==========================================
        // CONTINUE REQUEST
        // ==========================================

        filterChain.doFilter(request, response);
    }
}