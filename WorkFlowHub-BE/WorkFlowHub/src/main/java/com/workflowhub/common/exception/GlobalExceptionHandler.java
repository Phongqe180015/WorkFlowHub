package com.workflowhub.common.exception;

import com.workflowhub.common.dto.response.ErrorResponse;
import com.workflowhub.common.enums.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Centralised exception handler for all REST controllers.
 *
 * <p>All exceptions that cross the controller boundary are caught here.
 * The handler maps them to consistent {@link ErrorResponse} bodies and
 * appropriate HTTP status codes.</p>
 *
 * <h3>Principles:</h3>
 * <ul>
 *   <li>No stack traces exposed in responses (production-safe).</li>
 *   <li>Sensitive information (e.g., SQL, internal class names) is never returned.</li>
 *   <li>Each handler logs at an appropriate level: WARN for client errors (4xx),
 *       ERROR for server errors (5xx).</li>
 * </ul>
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // -----------------------------------------------------------------------
    // 400 — Bad Request
    // -----------------------------------------------------------------------

    /** Handles application-level bad-request exceptions. */
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(
            BadRequestException ex, HttpServletRequest request) {
        log.warn("Bad request at {}: {}", request.getRequestURI(), ex.getMessage());
        return buildResponse(ex.getErrorCode(), ex.getMessage(), null, request);
    }

    /** Handles {@code @Valid} / {@code @Validated} failures on request body DTOs. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<ErrorResponse.FieldError> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(fe -> ErrorResponse.FieldError.builder()
                        .field(fe.getField())
                        .message(fe.getDefaultMessage())
                        .build())
                .toList();
        log.warn("Validation failed at {}: {} field error(s)", request.getRequestURI(), fieldErrors.size());
        return buildResponse(ErrorCode.VALIDATION_ERROR, "Validation failed", fieldErrors, request);
    }

    /** Handles {@code @Validated} failures on path/query parameters (constraint violations). */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(
            ConstraintViolationException ex, HttpServletRequest request) {
        List<ErrorResponse.FieldError> fieldErrors = ex.getConstraintViolations()
                .stream()
                .map(cv -> {
                    String path = cv.getPropertyPath().toString();
                    // Strip method name prefix (e.g., "methodName.param" -> "param")
                    int dotIdx = path.lastIndexOf('.');
                    String field = dotIdx >= 0 ? path.substring(dotIdx + 1) : path;
                    return ErrorResponse.FieldError.builder()
                            .field(field)
                            .message(cv.getMessage())
                            .build();
                })
                .toList();
        log.warn("Constraint violation at {}: {} violation(s)", request.getRequestURI(), fieldErrors.size());
        return buildResponse(ErrorCode.VALIDATION_ERROR, "Validation failed", fieldErrors, request);
    }

    /** Handles malformed JSON request bodies. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleMessageNotReadable(
            HttpMessageNotReadableException ex, HttpServletRequest request) {
        log.warn("Unreadable message at {}: {}", request.getRequestURI(), ex.getMessage());
        return buildResponse(ErrorCode.INVALID_REQUEST, "Request body is malformed or missing", null, request);
    }

    /** Handles missing required request parameters. */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParam(
            MissingServletRequestParameterException ex, HttpServletRequest request) {
        String msg = "Required parameter '%s' is missing".formatted(ex.getParameterName());
        log.warn("Missing param at {}: {}", request.getRequestURI(), msg);
        return buildResponse(ErrorCode.INVALID_REQUEST, msg, null, request);
    }

    /** Handles type mismatch in request parameters (e.g., string where UUID expected). */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        String msg = "Invalid value '%s' for parameter '%s'".formatted(ex.getValue(), ex.getName());
        log.warn("Type mismatch at {}: {}", request.getRequestURI(), msg);
        return buildResponse(ErrorCode.INVALID_REQUEST, msg, null, request);
    }

    // -----------------------------------------------------------------------
    // 401 — Unauthorized
    // -----------------------------------------------------------------------

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(
            UnauthorizedException ex, HttpServletRequest request) {
        log.warn("Unauthorized access at {}: {}", request.getRequestURI(), ex.getMessage());
        return buildResponse(ex.getErrorCode(), ex.getMessage(), null, request);
    }

    /**
     * Handles Spring Security authentication failures.
     *
     * <p>Note: Spring Security typically handles these before the request reaches
     * a controller. This handler covers any AuthenticationException that leaks
     * through.</p>
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(
            AuthenticationException ex, HttpServletRequest request) {
        log.warn("Authentication failure at {}: {}", request.getRequestURI(), ex.getMessage());
        return buildResponse(ErrorCode.UNAUTHORIZED, "Authentication required", null, request);
    }

    // -----------------------------------------------------------------------
    // 403 — Forbidden
    // -----------------------------------------------------------------------

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ErrorResponse> handleForbidden(
            ForbiddenException ex, HttpServletRequest request) {
        log.warn("Access denied at {}: {}", request.getRequestURI(), ex.getMessage());
        return buildResponse(ex.getErrorCode(), ex.getMessage(), null, request);
    }

    /** Handles Spring Security access-denied exceptions. */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {
        log.warn("Access denied at {} by Spring Security", request.getRequestURI());
        return buildResponse(ErrorCode.FORBIDDEN, "Access denied", null, request);
    }

    // -----------------------------------------------------------------------
    // 404 — Not Found
    // -----------------------------------------------------------------------

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            NotFoundException ex, HttpServletRequest request) {
        log.warn("Resource not found at {}: {}", request.getRequestURI(), ex.getMessage());
        return buildResponse(ex.getErrorCode(), ex.getMessage(), null, request);
    }

    // -----------------------------------------------------------------------
    // 409 — Conflict
    // -----------------------------------------------------------------------

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(
            ConflictException ex, HttpServletRequest request) {
        log.warn("Conflict at {}: {}", request.getRequestURI(), ex.getMessage());
        return buildResponse(ex.getErrorCode(), ex.getMessage(), null, request);
    }

    /**
     * Handles database unique constraint violations thrown by JPA/Hibernate.
     *
     * <p>The original exception message is intentionally hidden because it may
     * contain table/column names that expose the database schema.</p>
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(
            DataIntegrityViolationException ex, HttpServletRequest request) {
        log.warn("Data integrity violation at {}: {}", request.getRequestURI(), ex.getMostSpecificCause().getMessage());
        return buildResponse(ErrorCode.RESOURCE_ALREADY_EXISTS, "A resource with the given data already exists", null, request);
    }

    // -----------------------------------------------------------------------
    // 500 — Internal Server Error
    // -----------------------------------------------------------------------

    @ExceptionHandler(InternalServerException.class)
    public ResponseEntity<ErrorResponse> handleInternal(
            InternalServerException ex, HttpServletRequest request) {
        log.error("Internal server error at {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        return buildResponse(ex.getErrorCode(), ex.getMessage(), null, request);
    }

    /**
     * Last-resort handler for any unhandled {@link RuntimeException}.
     *
     * <p>The exception detail is logged but NEVER exposed to the caller.
     * The client always receives a generic 500 message.</p>
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(
            Exception ex, HttpServletRequest request) {
        log.error("Unexpected error at {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        return buildResponse(
                ErrorCode.INTERNAL_SERVER_ERROR,
                ErrorCode.INTERNAL_SERVER_ERROR.getDefaultMessage(),
                null,
                request
        );
    }

    // -----------------------------------------------------------------------
    // Internal helpers
    // -----------------------------------------------------------------------

    private ResponseEntity<ErrorResponse> buildResponse(
            ErrorCode errorCode,
            String message,
            List<ErrorResponse.FieldError> errors,
            HttpServletRequest request) {

        ErrorResponse body = ErrorResponse.builder()
                .code(errorCode.name())
                .message(message)
                .errors(errors)
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(errorCode.getHttpStatus()).body(body);
    }
}
