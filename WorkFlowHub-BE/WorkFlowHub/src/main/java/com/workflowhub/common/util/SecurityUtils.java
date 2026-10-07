package com.workflowhub.common.util;

import com.workflowhub.common.constant.SecurityConstants;
import com.workflowhub.common.exception.UnauthorizedException;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
        // Utility class
    }

    /**
     * Lấy ID của người dùng đang đăng nhập từ MDC
     */
    public static Long getCurrentUserId() {
        String userIdStr = MDC.get(SecurityConstants.MDC_USER_ID);
        if (userIdStr != null && !userIdStr.isBlank()) {
            try {
                return Long.parseLong(userIdStr);
            } catch (NumberFormatException ignored) {
            }
        }
        throw new UnauthorizedException("Vui lòng đăng nhập để thực hiện thao tác");
    }

    /**
     * Lấy email của người dùng đang đăng nhập từ SecurityContextHolder
     */
    public static String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName();
        }
        throw new UnauthorizedException("Vui lòng đăng nhập để thực hiện thao tác");
    }
}