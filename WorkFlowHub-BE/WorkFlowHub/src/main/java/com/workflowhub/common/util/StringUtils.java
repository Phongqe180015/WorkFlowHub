package com.workflowhub.common.util;

import lombok.experimental.UtilityClass;

import java.util.UUID;

/**
 * Reusable string manipulation utilities.
 *
 * <p>Provides safe null-handling equivalents and common transformations.
 * Where Apache Commons Lang or Guava covers a need, prefer those —
 * this class only covers gaps or project-specific conventions.</p>
 */
@UtilityClass
public class StringUtils {

    /**
     * Returns {@code true} if the string is {@code null} or contains only whitespace.
     */
    public static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    /**
     * Returns {@code true} if the string is non-null and non-blank.
     */
    public static boolean isNotBlank(String value) {
        return !isBlank(value);
    }

    /**
     * Trims the string; returns {@code ""} if the input is {@code null}.
     */
    public static String trimOrEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    /**
     * Trims the string; returns {@code null} if the result is blank.
     *
     * <p>Useful when normalising optional form fields before persistence.</p>
     */
    public static String trimOrNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    /**
     * Truncates a string to the given maximum length, appending {@code "..."} if truncated.
     *
     * @param value  the input string
     * @param maxLen the maximum length (excluding the ellipsis)
     * @return the truncated string, or the original if shorter than {@code maxLen}
     */
    public static String truncate(String value, int maxLen) {
        if (value == null) return "";
        if (value.length() <= maxLen) return value;
        return value.substring(0, maxLen) + "...";
    }

    /**
     * Converts a string to {@code snake_case}.
     *
     * <p>Example: {@code "HelloWorld"} → {@code "hello_world"}</p>
     */
    public static String toSnakeCase(String camelCase) {
        if (isBlank(camelCase)) return camelCase;
        return camelCase
                .replaceAll("([A-Z]+)([A-Z][a-z])", "$1_$2")
                .replaceAll("([a-z])([A-Z])", "$1_$2")
                .toLowerCase();
    }

    /**
     * Masks a string by replacing all but the first and last 2 characters with {@code *}.
     *
     * <p>Used for safely logging sensitive data (e.g., partial email, token prefix).</p>
     *
     * @param value     the string to mask
     * @param visibleN  number of characters to leave visible at each end
     */
    public static String mask(String value, int visibleN) {
        if (isBlank(value)) return "";
        if (value.length() <= visibleN * 2) return "*".repeat(value.length());
        return value.substring(0, visibleN)
                + "*".repeat(value.length() - visibleN * 2)
                + value.substring(value.length() - visibleN);
    }

    /**
     * Returns {@code true} if the string is a valid UUID.
     */
    public static boolean isValidUUID(String value) {
        if (isBlank(value)) return false;
        try {
            UUID.fromString(value);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
