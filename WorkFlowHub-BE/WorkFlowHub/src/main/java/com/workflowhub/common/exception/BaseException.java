package com.workflowhub.common.exception;

import com.workflowhub.common.enums.ErrorCode;
import lombok.Getter;

/**
 * Base class for all application-level runtime exceptions.
 *
 * <p>Every exception in the WorkFlowHub exception hierarchy extends this class.
 * The {@link ErrorCode} carried by the exception allows the
 * {@link com.workflowhub.common.exception.GlobalExceptionHandler} to:
 * <ul>
 *   <li>Determine the HTTP response status without any instanceof checks</li>
 *   <li>Build a consistent {@link com.workflowhub.common.dto.response.ErrorResponse}</li>
 * </ul>
 * </p>
 *
 * <p>Concrete exception subclasses must supply the appropriate {@link ErrorCode}
 * in their constructors — they must NOT accept {@code ErrorCode} as a constructor
 * parameter from callers. This keeps the error-code-to-HTTP-status mapping
 * centralized.</p>
 */
@Getter
public abstract class BaseException extends RuntimeException {

    private final ErrorCode errorCode;

    protected BaseException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    protected BaseException(ErrorCode errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }
}
