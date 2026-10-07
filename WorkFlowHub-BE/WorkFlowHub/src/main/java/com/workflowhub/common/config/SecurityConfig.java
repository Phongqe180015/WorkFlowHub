package com.workflowhub.common.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.workflowhub.common.constant.ApiConstants;
import com.workflowhub.common.constant.AppConstants;
import com.workflowhub.common.dto.response.ErrorResponse;
import com.workflowhub.common.enums.ErrorCode;
import com.workflowhub.domain.workflow.security.jwt.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Spring Security configuration for WorkFlowHub.
 * Configured with JWT authentication filter, CORS support, and stateless session management.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ObjectMapper objectMapper;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow common origins including localhost and deployment domains
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    ErrorResponse errorResponse = ErrorResponse.builder()
                            .code(ErrorCode.UNAUTHORIZED.name())
                            .message("Authentication required: " + authException.getMessage())
                            .timestamp(LocalDateTime.now())
                            .path(request.getRequestURI())
                            .build();
                    objectMapper.writeValue(response.getOutputStream(), errorResponse);
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    ErrorResponse errorResponse = ErrorResponse.builder()
                            .code(ErrorCode.FORBIDDEN.name())
                            .message("Access denied: " + accessDeniedException.getMessage())
                            .timestamp(LocalDateTime.now())
                            .path(request.getRequestURI())
                            .build();
                    objectMapper.writeValue(response.getOutputStream(), errorResponse);
                })
            )
            .authorizeHttpRequests(auth -> auth
                // Allow all preflight OPTIONS requests from browsers
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // OpenAPI / Swagger UI / Actuator
                .requestMatchers(
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**",
                    "/actuator/**"
                ).permitAll()
                // Public auth endpoints
                .requestMatchers(
                    AppConstants.API_PREFIX + ApiConstants.AUTH + "/login",
                    AppConstants.API_PREFIX + ApiConstants.AUTH + "/register",
                    AppConstants.API_PREFIX + ApiConstants.AUTH + "/refresh-token"
                ).permitAll()
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
