package com.workflowhub.common.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum RoleEnums {
    ADMIN("ADMIN"),
    USER("User"),
    PROJECT_MANAGER("PROJECT_MANAGER"),
    DEVELOPER("DEVELOPER"),
    TESTER("TESTER"),
    VIEWER("VIEWER");

    private final String roleName;

    /**
     * So khớp tên role (không phân biệt hoa thường)
     */
    public boolean matches(String name) {
        if (name == null) return false;
        return this.roleName.equalsIgnoreCase(name) || this.name().equalsIgnoreCase(name);
    }

    /**
     * Parse an toàn từ chuỗi sang RoleEnums
     */
    public static RoleEnums fromString(String name) {
        if (name == null || name.isBlank()) return null;
        for (RoleEnums role : values()) {
            if (role.matches(name)) {
                return role;
            }
        }
        return null;
    }
}
