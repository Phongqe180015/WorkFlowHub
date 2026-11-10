package com.workflowhub.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.mail")
public record MailConfig(
        boolean enabled,
        String from,
        String resendApiKey,
        String frontendUrl
) {
}
