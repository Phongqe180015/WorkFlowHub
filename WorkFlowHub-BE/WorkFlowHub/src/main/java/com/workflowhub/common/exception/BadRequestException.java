package com.workflowhub.common.exception;

import com.workflowhub.common.enums.ErrorCode;

/**
 * Thrown when a request is syntactically correct but semantically invalid.
 * Maps to HTTP {@code 400 Bad Request}.
 *
 * <p>Examples: invalid enum value, conflicting request parameters,
 * malformed RSQL expression.</p>
 */
public class BadRequestException extends BaseException {

    public BadRequestException(String message) {
        super(ErrorCode.INVALID_REQUEST, message);
    }

    public BadRequestException(String message, Throwable cause) {
        super(ErrorCode.INVALID_REQUEST, message, cause);
    }

    public BadRequestException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }

    public BadRequestException(ErrorCode errorCode, String message, Throwable cause) {
        super(errorCode, message, cause);
    }
}
