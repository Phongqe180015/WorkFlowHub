package com.workflowhub.common.exception;

import com.workflowhub.common.enums.ErrorCode;

/**
 * Thrown when a create/update operation would violate a uniqueness constraint.
 * Maps to HTTP {@code 409 Conflict}.
 *
 * <p>Examples: duplicate email during user registration, duplicate project name
 * within the same organization.</p>
 */
public class ConflictException extends BaseException {

    public ConflictException(String message) {
        super(ErrorCode.RESOURCE_ALREADY_EXISTS, message);
    }

    public ConflictException(String message, Throwable cause) {
        super(ErrorCode.RESOURCE_ALREADY_EXISTS, message, cause);
    }
}
