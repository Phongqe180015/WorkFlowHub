package com.workflowhub.common.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Error response body returned by {@link com.workflowhub.common.exception.GlobalExceptionHandler}.
 *
 * <pre>{@code
 * {
 *   "success": false,
 *   "code": "RESOURCE_NOT_FOUND",
 *   "message": "Project not found",
 *   "errors": null,
 *   "timestamp": "2026-10-02T10:00:00",
 *   "path": "/api/v1/projects/123"
 * }
 * }</pre>
 *
 * <p>Validation errors include a non-null {@code errors} list with field-level detail.</p>
 *
 * <pre>{@code
 * {
 *   "success": false,
 *   "code": "VALIDATION_ERROR",
 *   "message": "Validation failed",
 *   "errors": [
 *     { "field": "email", "message": "must be a well-formed email address" }
 *   ],
 *   "timestamp": "...",
 *   "path": "..."
 * }
 * }</pre>
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private final boolean success = false;
    private final String code;
    private final String message;

    /** Populated only for validation errors; {@code null} for all other errors. */
    private final List<FieldError> errors;

    private final LocalDateTime timestamp;
    private final String path;

    // -----------------------------------------------------------------------
    // Nested type
    // -----------------------------------------------------------------------

    /**
     * A single field-level validation failure.
     */
    @Getter
    @Builder
    public static class FieldError {
        private final String field;
        private final String message;
    }
}
