package com.workflowhub.common.util;

import com.workflowhub.common.constant.DateTimeConstants;
import lombok.experimental.UtilityClass;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Optional;

/**
 * Reusable date and time utility methods.
 *
 * <h3>Timezone strategy:</h3>
 * <p>All methods producing "current time" return UTC by default.
 * The application stores timestamps in UTC; conversion to local
 * timezone is a presentation-layer concern.</p>
 *
 * <h3>Library choice:</h3>
 * <p>This class uses {@code java.time} exclusively.
 * {@code java.util.Date}, {@code Calendar}, and {@code SimpleDateFormat} are NOT used.</p>
 */
@UtilityClass
public class DateTimeUtils {

    // Pre-built formatters (thread-safe and reusable)
    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern(DateTimeConstants.DATE_FORMAT);

    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern(DateTimeConstants.DATE_TIME_FORMAT);

    private static final DateTimeFormatter DATE_TIME_MILLIS_FORMATTER =
            DateTimeFormatter.ofPattern(DateTimeConstants.DATE_TIME_MILLIS_FORMAT);

    private static final DateTimeFormatter DISPLAY_DATE_FORMATTER =
            DateTimeFormatter.ofPattern(DateTimeConstants.DISPLAY_DATE_FORMAT);

    private static final DateTimeFormatter DISPLAY_DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern(DateTimeConstants.DISPLAY_DATE_TIME_FORMAT);

    // -----------------------------------------------------------------------
    // Current time
    // -----------------------------------------------------------------------

    /** Returns the current instant as a UTC {@link LocalDateTime}. */
    public static LocalDateTime nowUtc() {
        return LocalDateTime.now(ZoneOffset.UTC);
    }

    /** Returns the current UTC date only. */
    public static LocalDate todayUtc() {
        return LocalDate.now(ZoneOffset.UTC);
    }

    // -----------------------------------------------------------------------
    // Formatting
    // -----------------------------------------------------------------------

    /**
     * Formats a {@link LocalDate} as {@code yyyy-MM-dd}.
     *
     * @param date the date to format; returns empty string if null
     */
    public static String formatDate(LocalDate date) {
        if (date == null) return "";
        return DATE_FORMATTER.format(date);
    }

    /**
     * Formats a {@link LocalDateTime} as {@code yyyy-MM-dd'T'HH:mm:ss}.
     *
     * @param dateTime the datetime to format; returns empty string if null
     */
    public static String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        return DATE_TIME_FORMATTER.format(dateTime);
    }

    /**
     * Formats a {@link LocalDateTime} including milliseconds:
     * {@code yyyy-MM-dd'T'HH:mm:ss.SSS}.
     */
    public static String formatDateTimeWithMillis(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        return DATE_TIME_MILLIS_FORMATTER.format(dateTime);
    }

    /** Formats a {@link LocalDate} for display: {@code dd/MM/yyyy}. */
    public static String formatDisplayDate(LocalDate date) {
        if (date == null) return "";
        return DISPLAY_DATE_FORMATTER.format(date);
    }

    /** Formats a {@link LocalDateTime} for display: {@code dd/MM/yyyy HH:mm:ss}. */
    public static String formatDisplayDateTime(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        return DISPLAY_DATE_TIME_FORMATTER.format(dateTime);
    }

    // -----------------------------------------------------------------------
    // Parsing
    // -----------------------------------------------------------------------

    /**
     * Parses a {@code yyyy-MM-dd} string to a {@link LocalDate}.
     *
     * @param dateString the string to parse
     * @return an {@link Optional} containing the date, or empty if null/blank/invalid
     */
    public static Optional<LocalDate> parseDate(String dateString) {
        if (dateString == null || dateString.isBlank()) return Optional.empty();
        try {
            return Optional.of(LocalDate.parse(dateString.trim(), DATE_FORMATTER));
        } catch (DateTimeParseException e) {
            return Optional.empty();
        }
    }

    /**
     * Parses a {@code yyyy-MM-dd'T'HH:mm:ss} string to a {@link LocalDateTime}.
     *
     * @param dateTimeString the string to parse
     * @return an {@link Optional} containing the datetime, or empty if invalid
     */
    public static Optional<LocalDateTime> parseDateTime(String dateTimeString) {
        if (dateTimeString == null || dateTimeString.isBlank()) return Optional.empty();
        try {
            return Optional.of(LocalDateTime.parse(dateTimeString.trim(), DATE_TIME_FORMATTER));
        } catch (DateTimeParseException e) {
            return Optional.empty();
        }
    }

    // -----------------------------------------------------------------------
    // Range helpers
    // -----------------------------------------------------------------------

    /**
     * Returns the start of the given date (midnight, {@code 00:00:00.000000000}).
     *
     * @param date the target date
     */
    public static LocalDateTime startOfDay(LocalDate date) {
        return date.atStartOfDay();
    }

    /**
     * Returns the end of the given date ({@code 23:59:59.999999999}).
     *
     * @param date the target date
     */
    public static LocalDateTime endOfDay(LocalDate date) {
        return date.atTime(LocalTime.MAX);
    }

    /**
     * Returns {@code true} if {@code target} falls within the inclusive range
     * {@code [from, to]}.
     *
     * @param target the datetime to test
     * @param from   start of the range (inclusive)
     * @param to     end of the range (inclusive)
     */
    public static boolean isInRange(LocalDateTime target, LocalDateTime from, LocalDateTime to) {
        if (target == null || from == null || to == null) return false;
        return !target.isBefore(from) && !target.isAfter(to);
    }

    /**
     * Returns {@code true} if {@code target} falls within the inclusive date range
     * {@code [from, to]}.
     */
    public static boolean isInRange(LocalDate target, LocalDate from, LocalDate to) {
        if (target == null || from == null || to == null) return false;
        return !target.isBefore(from) && !target.isAfter(to);
    }
}
