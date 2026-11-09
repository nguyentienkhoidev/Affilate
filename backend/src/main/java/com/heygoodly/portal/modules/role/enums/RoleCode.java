package com.heygoodly.portal.modules.role.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Standard Security Role Enum.
 * Provides typed authority values for Spring Security @PreAuthorize expressions and identity resolution.
 */
@Getter
@RequiredArgsConstructor
public enum RoleCode {
    SUPER_ADMIN("ROLE_SUPER_ADMIN", "super_admin"),
    ADMIN("ROLE_ADMIN", "admin"),
    STAFF("ROLE_STAFF", "staff");

    private final String authority;
    private final String slug;

    public static final String ROLE_SUPER_ADMIN = "ROLE_SUPER_ADMIN";
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_STAFF = "ROLE_STAFF";

    public static RoleCode fromSlug(String slug) {
        if (slug == null) {
            return STAFF;
        }
        for (RoleCode r : values()) {
            if (r.slug.equalsIgnoreCase(slug.trim()) || r.name().equalsIgnoreCase(slug.trim())) {
                return r;
            }
        }
        return STAFF;
    }
}

