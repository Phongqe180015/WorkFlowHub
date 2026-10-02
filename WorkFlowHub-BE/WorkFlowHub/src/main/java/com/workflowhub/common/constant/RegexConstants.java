package com.workflowhub.common.constant;

/**
 * Reusable regex pattern strings.
 *
 * <p>Use these constants with {@code @Pattern} annotations or
 * {@link com.workflowhub.common.util.ValidationUtils} helpers.</p>
 *
 * <p><strong>Note:</strong> Prefer Bean Validation annotations ({@code @Email},
 * {@code @NotBlank}, etc.) over manual regex where possible. These patterns
 * exist for cases where standard annotations are insufficient.</p>
 */
public final class RegexConstants {

    private RegexConstants() {
        throw new UnsupportedOperationException("RegexConstants is a utility class");
    }

    /**
     * Matches RFC 5322 email addresses.
     * Prefer {@code @Email} from Bean Validation for simpler cases.
     */
    public static final String EMAIL =
            "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$";

    /**
     * Matches international phone numbers:
     * optional {@code +} followed by 7–15 digits.
     */
    public static final String PHONE = "^\\+?[1-9]\\d{6,14}$";

    /**
     * Matches usernames: 3–30 characters, letters, digits, underscores, hyphens.
     * Must start with a letter.
     */
    public static final String USERNAME = "^[a-zA-Z][a-zA-Z0-9_\\-]{2,29}$";

    /**
     * Matches passwords with at least:
     * <ul>
     *   <li>8 characters minimum</li>
     *   <li>1 uppercase letter</li>
     *   <li>1 lowercase letter</li>
     *   <li>1 digit</li>
     *   <li>1 special character</li>
     * </ul>
     */
    public static final String PASSWORD =
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";

    /**
     * Matches canonical UUID format:
     * {@code xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}
     */
    public static final String UUID =
            "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$";

    /**
     * Safe RSQL field selector: letters, digits, dots (nested paths), underscores.
     * Must start with a letter. Used to whitelist RSQL field names.
     */
    public static final String RSQL_SAFE_SELECTOR = "^[a-zA-Z][a-zA-Z0-9_.]*$";
}
