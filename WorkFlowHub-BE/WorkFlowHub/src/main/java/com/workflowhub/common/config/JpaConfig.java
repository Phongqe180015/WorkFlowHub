package com.workflowhub.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.auditing.DateTimeProvider;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

/**
 * JPA configuration: enables auditing for {@code @CreatedDate} and
 * {@code @LastModifiedDate} on {@link com.workflowhub.common.entity.BaseEntity}.
 *
 * <h3>{@code dateTimeProviderRef}:</h3>
 * <p>We register a custom {@link DateTimeProvider} bean that returns UTC timestamps.
 * Without this, Spring Data uses the JVM default timezone which can cause
 * inconsistencies in environments with different system clocks.</p>
 *
 * <h3>AuditorAware:</h3>
 * <p>An {@code AuditorAware<UUID>} bean (for tracking which user created/modified a resource)
 * is intentionally NOT provided here. Business modules that need {@code createdBy} /
 * {@code updatedBy} fields must provide their own {@code @Primary AuditorAware} bean
 * that reads from the current security context.</p>
 */
@Configuration
@EnableJpaAuditing(dateTimeProviderRef = "utcDateTimeProvider")
public class JpaConfig {

    /**
     * Provides the current UTC time to the JPA auditing infrastructure.
     *
     * <p>Annotated with {@code @Bean} so Spring Data's auditing can reference it
     * by the name {@code "utcDateTimeProvider"}.</p>
     */
    @Bean
    public DateTimeProvider utcDateTimeProvider() {
        return () -> Optional.of(LocalDateTime.now(ZoneOffset.UTC));
    }
}
