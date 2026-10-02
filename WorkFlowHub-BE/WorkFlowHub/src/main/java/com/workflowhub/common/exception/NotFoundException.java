package com.workflowhub.common.exception;

import com.workflowhub.common.enums.ErrorCode;

/**
 * Thrown when the requested resource does not exist in the system.
 * Maps to HTTP {@code 404 Not Found}.
 *
 * <p>Service methods should throw this exception when
 * {@code repository.findById(id)} returns an empty {@link java.util.Optional}.</p>
 */
public class NotFoundException extends BaseException {

    public NotFoundException(String message) {
        super(ErrorCode.RESOURCE_NOT_FOUND, message);
    }

    public NotFoundException(String message, Throwable cause) {
        super(ErrorCode.RESOURCE_NOT_FOUND, message, cause);
    }

    /**
     * Convenience factory for the common "X not found with id: Y" message.
     *
     * @param resourceName the entity type name (e.g., "Project")
     * @param id           the identifier that was not found
     * @return a new {@code NotFoundException} with a descriptive message
     */
    public static NotFoundException of(String resourceName, Object id) {
        return new NotFoundException("%s not found with id: %s".formatted(resourceName, id));
    }
}
