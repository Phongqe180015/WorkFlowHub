package com.workflowhub.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Baseline Spring Security configuration for WorkFlowHub.
 *
 * <p>This configuration provides a minimal, correct starting point.
 * Business modules (auth, user, etc.) extend this by defining their own
 * {@code SecurityFilterChain} beans with higher {@code @Order} values.</p>
 *
 * <h3>Defaults:</h3>
 * <ul>
 *   <li>Stateless session (JWT-based auth)</li>
 *   <li>CSRF disabled (REST API — no browser session)</li>
 *   <li>Actuator and OpenAPI endpoints open (adjust per environment)</li>
 *   <li>All other requests require authentication</li>
 * </ul>
 *
 * <p><strong>TODO:</strong> Replace the {@code permitAll()} on {@code /api/**}
 * with proper JWT validation once the auth module is implemented.</p>
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // OpenAPI / Swagger UI — always public
                .requestMatchers(
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**",
                    "/actuator/health"
                ).permitAll()
                // TODO: Replace with JWT auth once auth module is implemented
                .anyRequest().permitAll()
            );

        return http.build();
    }
}
