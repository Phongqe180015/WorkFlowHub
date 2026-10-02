package com.workflowhub.common.enums;

import org.springframework.http.HttpStatus;

/**
 * Canonical error codes for the WorkFlowHub API.
 *
 * <p>Each constant maps to an HTTP status so the {@code GlobalExceptionHandler}
 * can derive the response status from the exception's error code alone —
 * keeping HTTP concerns out of service and domain layers.</p>
 */
public enum ErrorCode {

    // -----------------------------------------------------------------------
    // 2xx
    // -----------------------------------------------------------------------
    SUCCESS(HttpStatus.OK, "Request successful"),

    // -----------------------------------------------------------------------
    // 400
    // -----------------------------------------------------------------------
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "Invalid request"),
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "Validation failed"),
    INVALID_RSQL(HttpStatus.BAD_REQUEST, "Invalid RSQL filter expression"),

    // -----------------------------------------------------------------------
    // 401
    // -----------------------------------------------------------------------
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Authentication required"),

    // -----------------------------------------------------------------------
    // 403
    // -----------------------------------------------------------------------
    FORBIDDEN(HttpStatus.FORBIDDEN, "Access denied"),

    // -----------------------------------------------------------------------
    // 404
    // -----------------------------------------------------------------------
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "Resource not found"),

    // -----------------------------------------------------------------------
    // 409
    // -----------------------------------------------------------------------
    RESOURCE_ALREADY_EXISTS(HttpStatus.CONFLICT, "Resource already exists"),
    OPTIMISTIC_LOCK_CONFLICT(HttpStatus.CONFLICT, "Resource was modified by another user"),

    // -----------------------------------------------------------------------
    // 500
    // -----------------------------------------------------------------------
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");

    // -----------------------------------------------------------------------

    private final HttpStatus httpStatus;
    private final String defaultMessage;

    ErrorCode(HttpStatus httpStatus, String defaultMessage) {
        this.httpStatus = httpStatus;
        this.defaultMessage = defaultMessage;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public int getHttpStatusCode() {
        return httpStatus.value();
    }

    public String getDefaultMessage() {
        return defaultMessage;
    }
}
