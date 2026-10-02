package com.workflowhub.common.config;

import com.workflowhub.common.constant.SecurityConstants;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Servlet filter that assigns a unique request ID to every incoming HTTP request
 * for distributed tracing and log correlation.
 *
 * <h3>Behaviour:</h3>
 * <ol>
 *   <li>Reads the {@code X-Request-ID} header from the incoming request.</li>
 *   <li>If absent, generates a new random UUID as the request ID.</li>
 *   <li>Places the request ID in the SLF4J {@link MDC} under the key
 *       {@link SecurityConstants#MDC_REQUEST_ID} so it appears in all log lines
 *       produced during this request.</li>
 *   <li>Echoes the request ID back in the response via the {@code X-Request-ID} header.</li>
 *   <li>Clears the MDC after the response to prevent MDC leakage across requests
 *       when using thread pools.</li>
 * </ol>
 *
 * <h3>Log pattern:</h3>
 * <p>Add {@code %X{requestId}} to your {@code logback-spring.xml} pattern to
 * include the request ID in log output.</p>
 */
@Slf4j
@Component
public class RequestIdFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String requestId = request.getHeader(SecurityConstants.REQUEST_ID_HEADER);
        if (requestId == null || requestId.isBlank()) {
            requestId = UUID.randomUUID().toString();
        }

        // Add to MDC for log correlation
        MDC.put(SecurityConstants.MDC_REQUEST_ID, requestId);

        // Echo back in response so callers can correlate their logs
        response.setHeader(SecurityConstants.REQUEST_ID_HEADER, requestId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            // MUST clear MDC after request completes to prevent thread pool leakage
            MDC.remove(SecurityConstants.MDC_REQUEST_ID);
        }
    }
}
