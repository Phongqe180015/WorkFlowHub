package com.workflowhub.common.exception;

import com.workflowhub.common.enums.ErrorCode;

/**
 * Thrown when an authenticated user attempts an action they are not permitted to perform.
 * Maps to HTTP {@code 403 Forbidden}.
 *
 * <p>Identity is established (authentication succeeded), but the authorization check failed.</p>
 */
public class ForbiddenException extends BaseException {

    public ForbiddenException(String message) {
        super(ErrorCode.FORBIDDEN, message);
    }

    public ForbiddenException(String message, Throwable cause) {
        super(ErrorCode.FORBIDDEN, message, cause);
    }
}
