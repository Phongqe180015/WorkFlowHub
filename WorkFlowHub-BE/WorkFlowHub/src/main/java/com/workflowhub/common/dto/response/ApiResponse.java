package com.workflowhub.common.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.workflowhub.common.enums.ErrorCode;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Standard envelope for all successful API responses.
 *
 * <pre>{@code
 * {
 *   "success": true,
 *   "code": "SUCCESS",
 *   "message": "Request successful",
 *   "data": { ... },
 *   "timestamp": "2026-10-02T10:00:00"
 * }
 * }</pre>
 *
 * <p>Use the static factory methods rather than the builder directly
 * to keep response construction consistent across controllers.</p>
 *
 * @param <T> the type of the response payload
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean success;
    private final String code;
    private final String message;
    private final T data;
    private final LocalDateTime timestamp;

    // -----------------------------------------------------------------------
    // Static factories
    // -----------------------------------------------------------------------

    /**
     * Builds a 200 OK response.
     *
     * @param data    the response payload
     * @param message a human-readable description
     * @param <T>     the payload type
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .code(ErrorCode.SUCCESS.name())
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /** Builds a 200 OK response with the default message. */
    public static <T> ApiResponse<T> success(T data) {
        return success(data, ErrorCode.SUCCESS.getDefaultMessage());
    }

    /**
     * Builds a 201 Created response.
     *
     * @param data the newly created resource
     */
    public static <T> ApiResponse<T> created(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .code(ErrorCode.SUCCESS.name())
                .message("Resource created successfully")
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Builds a 204 No Content response (no body needed, but using this wrapper
     * for consistency in the rare case a body is required).
     */
    public static ApiResponse<Void> noContent() {
        return ApiResponse.<Void>builder()
                .success(true)
                .code(ErrorCode.SUCCESS.name())
                .message("Operation completed successfully")
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Builds an error response (use {@link ErrorResponse} for HTTP error bodies;
     * this overload is exposed for non-HTTP use cases).
     */
    public static <T> ApiResponse<T> error(ErrorCode errorCode, String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .code(errorCode.name())
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
