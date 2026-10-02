package com.workflowhub.common.constant;

/**
 * Application-wide constants.
 *
 * <p>Centralising these values prevents magic strings from spreading across
 * the codebase and makes global changes trivial.</p>
 */
public final class AppConstants {

    private AppConstants() {
        throw new UnsupportedOperationException("AppConstants is a utility class");
    }

    /** Base path for all API endpoints. */
    public static final String API_PREFIX = "/api/v1";

    /** Default page index (0-based). */
    public static final int DEFAULT_PAGE = 0;

    /** Default number of items per page. */
    public static final int DEFAULT_PAGE_SIZE = 20;

    /** Maximum allowed page size to prevent excessive DB queries. */
    public static final int MAX_PAGE_SIZE = 100;

    /** Default sort field when no sort is specified. */
    public static final String DEFAULT_SORT_FIELD = "createdAt";

    /** Application name used in logs and correlation headers. */
    public static final String APP_NAME = "WorkFlowHub";
}
