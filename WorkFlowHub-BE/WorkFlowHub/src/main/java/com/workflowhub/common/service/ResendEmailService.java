package com.workflowhub.common.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.workflowhub.common.config.MailConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResendEmailService {

    private static final String RESEND_EMAILS_URL = "https://api.resend.com/emails";
    public static final String AUTHORIZATION = "Authorization";
    public static final String BEARER = "Bearer ";

    private final RestClient.Builder restClientBuilder;
    private final MailConfig mailConfig;

    public void send(String recipient, String subject, String text) {
        if (mailConfig.resendApiKey() == null || mailConfig.resendApiKey().isBlank()) {
            throw new IllegalStateException("RESEND_API_KEY is required when email notifications are enabled");
        }
        if (mailConfig.from() == null || mailConfig.from().isBlank()) {
            throw new IllegalStateException("MAIL_FROM is required when email notifications are enabled");
        }

        try {
            restClientBuilder.build()
                    .post()
                    .uri(RESEND_EMAILS_URL)
                    .header(AUTHORIZATION, BEARER + mailConfig.resendApiKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ResendEmailRequest(mailConfig.from(), List.of(recipient), subject, text))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException ex) {
            throw new ResendEmailException("Resend rejected the email request", ex);
        }
    }

    private record ResendEmailRequest(
            String from,
            List<String> to,
            String subject,
            String text
    ) {
    }

    public static class ResendEmailException extends RuntimeException {
        public ResendEmailException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
