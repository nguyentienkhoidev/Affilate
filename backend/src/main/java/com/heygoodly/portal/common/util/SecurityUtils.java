package com.heygoodly.portal.common.util;

import com.heygoodly.portal.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public final class SecurityUtils {
    private SecurityUtils() {}

    public static Optional<UserPrincipal> getCurrentUserPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            return Optional.of(principal);
        }
        return Optional.empty();
    }

    public static Optional<Long> getCurrentUserId() {
        return getCurrentUserPrincipal().map(UserPrincipal::getId);
    }

    public static Optional<String> getCurrentUserEmail() {
        return getCurrentUserPrincipal().map(UserPrincipal::getEmail);
    }

    public static boolean isSuperAdmin() {
        return getCurrentUserPrincipal().map(UserPrincipal::isSuperAdmin).orElse(false);
    }

    public static boolean isStaffOrAdmin() {
        return getCurrentUserPrincipal().map(principal -> {
            if (principal.isSuperAdmin()) {
                return true;
            }
            if (principal.getAuthorities() == null) {
                return false;
            }
            return principal.getAuthorities().stream().anyMatch(a -> {
                String auth = a.getAuthority();
                return auth != null && (auth.contains("ADMIN") || auth.contains("EDITOR") || auth.contains("POST"));
            });
        }).orElse(false);
    }
}
