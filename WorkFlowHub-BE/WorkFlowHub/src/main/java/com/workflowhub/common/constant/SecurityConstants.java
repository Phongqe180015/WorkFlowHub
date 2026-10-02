package com.workflowhub.common.constant;

/**
 * Security-related string constants used across filter chains, JWT processing,
 * and security configuration.
 *
 * <p><strong>IMPORTANT:</strong> Actual secrets (signing keys, client secrets, etc.)
 * must NEVER be stored here. Use environment variables or a secrets manager.</p>
 */
public final class SecurityConstants {

    private SecurityConstants() {
        throw new UnsupportedOperationException("SecurityConstants is a utility class");
    }

    // -----------------------------------------------------------------------
    // HTTP Headers
    // -----------------------------------------------------------------------

    /** Standard HTTP Authorization header name. */
    public static final String AUTHORIZATION_HEADER = "Authorization";

    /** Prefix for Bearer token in the Authorization header. */
    public static final String BEARER_PREFIX = "Bearer ";

    /** Custom header for request correlation/tracing. */
    public static final String REQUEST_ID_HEADER = "X-Request-ID";

    // -----------------------------------------------------------------------
    // JWT Claims
    // -----------------------------------------------------------------------

    /** JWT claim carrying the user's UUID. */
    public static final String JWT_CLAIM_USER_ID = "userId";

    /** JWT claim carrying the user's roles as a list of strings. */
    public static final String JWT_CLAIM_ROLES = "roles";

    /** JWT claim carrying the user's email. */
    public static final String JWT_CLAIM_EMAIL = "email";

    // -----------------------------------------------------------------------
    // Cookie / Storage Names
    // -----------------------------------------------------------------------

    /** Cookie / Redis key name for the refresh token. */
    public static final String REFRESH_TOKEN = "refreshToken";

    /** Cookie name for the access token (if stored in cookie). */
    public static final String ACCESS_TOKEN_COOKIE = "accessToken";

    // -----------------------------------------------------------------------
    // MDC Keys (for structured logging)
    // -----------------------------------------------------------------------

    /** MDC key for the correlation/request ID. */
    public static final String MDC_REQUEST_ID = "requestId";

    /** MDC key for the authenticated user ID. */
    public static final String MDC_USER_ID = "userId";
}
