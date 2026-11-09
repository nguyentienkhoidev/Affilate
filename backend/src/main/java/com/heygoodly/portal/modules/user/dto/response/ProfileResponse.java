package com.heygoodly.portal.modules.user.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record ProfileResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        String avatar,
        String department,
        String timezone,
        String bio,
        String socialX,
        String socialLinkedIn,
        String roleName,
        String roleSlug,
        boolean isSuperAdmin,
        boolean twoFactorEnabled,
        Instant lastLoginAt,
        String lastLoginIp,
        Instant passwordUpdatedAt,
        List<String> permissions,
        Map<String, Boolean> notificationPreferences
) {}

