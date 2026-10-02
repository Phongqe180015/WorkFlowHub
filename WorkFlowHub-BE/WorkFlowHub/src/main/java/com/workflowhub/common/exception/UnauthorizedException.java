package com.workflowhub.common.exception;

import com.workflowhub.common.enums.ErrorCode;

/**
 * Thrown when authentication credentials are missing or invalid.
 * Maps to HTTP {@code 401 Unauthorized}.
 *
 * <p>Note: despite the HTTP status name "Unauthorized", this exception
 * represents <em>unauthenticated</em> access — the caller has not
 * (or cannot) establish their identity.</p>
 */
public class UnauthorizedException extends BaseException {

    public UnauthorizedException(String message) {
        super(ErrorCode.UNAUTHORIZED, message);
    }

    public UnauthorizedException(String message, Throwable cause) {
        super(ErrorCode.UNAUTHORIZED, message, cause);
    }
}
