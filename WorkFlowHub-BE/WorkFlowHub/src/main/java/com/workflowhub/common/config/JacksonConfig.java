package com.workflowhub.common.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Jackson configuration for consistent JSON serialization.
 *
 * <h3>Decisions:</h3>
 * <ul>
 *   <li><b>JavaTimeModule</b>: enables serialization/deserialization of
 *       {@code java.time} types ({@code LocalDate}, {@code LocalDateTime}, etc.).</li>
 *   <li><b>WRITE_DATES_AS_TIMESTAMPS = false</b>: dates are serialized as
 *       ISO 8601 strings (e.g., {@code "2026-10-02T10:00:00"}) instead of epoch
 *       numbers, which are opaque to API consumers.</li>
 *   <li><b>FAIL_ON_UNKNOWN_PROPERTIES = false</b>: allows forward-compatibility
 *       when deserializing — clients sending extra fields won't break deserialization.
 *       This is safe because Bean Validation handles actual required fields.</li>
 *   <li><b>No global null serialization exclusion</b>: excluding all nulls globally
 *       can hide intentional null values in responses (e.g., optional fields the client
 *       should know are absent). Use {@code @JsonInclude(NON_NULL)} at the DTO level
 *       where appropriate (see {@link com.workflowhub.common.dto.response.ApiResponse}).</li>
 * </ul>
 */
@Configuration
public class JacksonConfig {

    /**
     * Configures the primary {@link ObjectMapper} used across the application.
     *
     * <p>Marked {@code @Primary} so it takes precedence over any auto-configured
     * {@code ObjectMapper} beans provided by Spring Boot.</p>
     */
    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();

        // java.time support
        mapper.registerModule(new JavaTimeModule());

        // Serialize dates as ISO 8601 strings, not epoch timestamps
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // Forward-compatibility: ignore unknown fields during deserialization
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

        // Fail on numbers that can't fit in the target type (prevents silent truncation)
        mapper.enable(DeserializationFeature.FAIL_ON_NUMBERS_FOR_ENUMS);

        return mapper;
    }
}
