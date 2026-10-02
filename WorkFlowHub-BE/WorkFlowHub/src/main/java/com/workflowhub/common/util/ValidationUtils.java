package com.workflowhub.common.util;

import com.workflowhub.common.constant.RegexConstants;
import com.workflowhub.common.exception.BadRequestException;
import lombok.experimental.UtilityClass;

import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Programmatic validation helpers for use in service-layer code.
 *
 * <p>These utilities complement Bean Validation ({@code @NotNull}, {@code @Email}, etc.)
 * for cases where declarative annotations are insufficient — for example,
 * cross-field validation or business rule guards inside service methods.</p>
 *
 * <p>Each method throws a {@link BadRequestException} on failure,
 * keeping HTTP semantics out of the caller.</p>
 */
@UtilityClass
public class ValidationUtils {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(RegexConstants.EMAIL);
    private static final Pattern PHONE_PATTERN = Pattern.compile(RegexConstants.PHONE);
    private static final Pattern USERNAME_PATTERN = Pattern.compile(RegexConstants.USERNAME);
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(RegexConstants.PASSWORD);
    private static final Pattern UUID_PATTERN = Pattern.compile(RegexConstants.UUID);

    // -----------------------------------------------------------------------
    // Guard methods (throw on violation)
    // -----------------------------------------------------------------------

    /**
     * Asserts that {@code value} is not null, throwing a {@link BadRequestException}
     * with {@code fieldName} in the message if it is.
     */
    public static void requireNonNull(Object value, String fieldName) {
        if (value == null) {
            throw new BadRequestException("'%s' must not be null".formatted(fieldName));
        }
    }

    /**
     * Asserts that {@code value} is not blank.
     */
    public static void requireNotBlank(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException("'%s' must not be blank".formatted(fieldName));
        }
    }

    /**
     * Asserts that {@code value} is a valid email address.
     */
    public static void requireValidEmail(String value) {
        requireNotBlank(value, "email");
        if (!EMAIL_PATTERN.matcher(value).matches()) {
            throw new BadRequestException("'%s' is not a valid email address".formatted(value));
        }
    }

    /**
     * Asserts that {@code value} is a valid phone number.
     */
    public static void requireValidPhone(String value) {
        requireNotBlank(value, "phone");
        if (!PHONE_PATTERN.matcher(value).matches()) {
            throw new BadRequestException("'%s' is not a valid phone number".formatted(value));
        }
    }

    /**
     * Asserts that {@code value} meets the password strength requirements.
     */
    public static void requireValidPassword(String value) {
        requireNotBlank(value, "password");
        if (!PASSWORD_PATTERN.matcher(value).matches()) {
            throw new BadRequestException(
                    "Password must be at least 8 characters and contain uppercase, lowercase, digit, and special character");
        }
    }

    /**
     * Asserts that {@code value} meets the username format requirements.
     */
    public static void requireValidUsername(String value) {
        requireNotBlank(value, "username");
        if (!USERNAME_PATTERN.matcher(value).matches()) {
            throw new BadRequestException(
                    "'%s' is not a valid username (3-30 chars, letters/digits/underscores/hyphens, must start with a letter)"
                            .formatted(value));
        }
    }

    /**
     * Asserts that {@code value} is a well-formed UUID string.
     *
     * @return the parsed {@link UUID}
     */
    public static UUID requireValidUUID(String value, String fieldName) {
        requireNotBlank(value, fieldName);
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("'%s' must be a valid UUID, got: %s".formatted(fieldName, value));
        }
    }

    /**
     * Asserts {@code condition} is true, throwing a {@link BadRequestException}
     * with the given message if not.
     */
    public static void require(boolean condition, String message) {
        if (!condition) {
            throw new BadRequestException(message);
        }
    }

    // -----------------------------------------------------------------------
    // Boolean check methods (no exceptions)
    // -----------------------------------------------------------------------

    public static boolean isValidEmail(String value) {
        return value != null && EMAIL_PATTERN.matcher(value).matches();
    }

    public static boolean isValidPhone(String value) {
        return value != null && PHONE_PATTERN.matcher(value).matches();
    }

    public static boolean isValidUUID(String value) {
        return value != null && UUID_PATTERN.matcher(value).matches();
    }
}
