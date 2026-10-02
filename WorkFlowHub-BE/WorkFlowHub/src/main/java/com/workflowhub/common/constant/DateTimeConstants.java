package com.workflowhub.common.constant;

import java.time.ZoneOffset;
import java.time.ZoneId;

/**
 * Centralised date and time format constants.
 *
 * <p>All format strings follow ISO 8601 conventions by default.
 * Human-readable display formats are prefixed with {@code DISPLAY_}.</p>
 *
 * <p>The application stores all timestamps in <strong>UTC</strong>.
 * Conversion to local time zones is the responsibility of the client.</p>
 */
public final class DateTimeConstants {

    private DateTimeConstants() {
        throw new UnsupportedOperationException("DateTimeConstants is a utility class");
    }

    // -----------------------------------------------------------------------
    // Storage / API formats (ISO 8601)
    // -----------------------------------------------------------------------

    /** {@code yyyy-MM-dd} — date-only format. */
    public static final String DATE_FORMAT = "yyyy-MM-dd";

    /** {@code yyyy-MM-dd'T'HH:mm:ss} — date-time without milliseconds. */
    public static final String DATE_TIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";

    /** {@code yyyy-MM-dd'T'HH:mm:ss.SSS} — date-time with milliseconds. */
    public static final String DATE_TIME_MILLIS_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSS";

    // -----------------------------------------------------------------------
    // Display formats (human-readable)
    // -----------------------------------------------------------------------

    /** {@code dd/MM/yyyy} — human-readable date. */
    public static final String DISPLAY_DATE_FORMAT = "dd/MM/yyyy";

    /** {@code dd/MM/yyyy HH:mm:ss} — human-readable date-time. */
    public static final String DISPLAY_DATE_TIME_FORMAT = "dd/MM/yyyy HH:mm:ss";

    // -----------------------------------------------------------------------
    // Timezone strategy
    // -----------------------------------------------------------------------

    /**
     * The application's canonical timezone.
     * All timestamps are persisted in UTC; conversion is done at presentation time.
     */
    public static final ZoneOffset UTC_OFFSET = ZoneOffset.UTC;

    /** UTC zone ID for use with {@link java.time.ZonedDateTime}. */
    public static final ZoneId UTC_ZONE = ZoneId.of("UTC");
}
