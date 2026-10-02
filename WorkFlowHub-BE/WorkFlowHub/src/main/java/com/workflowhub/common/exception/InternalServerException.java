package com.workflowhub.common.exception;

import com.workflowhub.common.enums.ErrorCode;

/**
 * Thrown when an unexpected condition prevents the server from fulfilling a request.
 * Maps to HTTP {@code 500 Internal Server Error}.
 *
 * <p>Use sparingly — most errors should map to more specific 4xx codes.
 * Reserve this for truly unexpected failures (e.g., third-party service unavailability,
 * infrastructure errors that callers cannot resolve).</p>
 *
 * <p>The {@link com.workflowhub.common.exception.GlobalExceptionHandler} also
 * handles unexpected {@link RuntimeException}s and maps them to 500 automatically,
 * so you generally only need to throw this explicitly when wrapping a known
 * infrastructure failure.</p>
 */
public class InternalServerException extends BaseException {

    public InternalServerException(String message) {
        super(ErrorCode.INTERNAL_SERVER_ERROR, message);
    }

    public InternalServerException(String message, Throwable cause) {
        super(ErrorCode.INTERNAL_SERVER_ERROR, message, cause);
    }
}
