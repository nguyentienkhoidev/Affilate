package com.heygoodly.portal.modules.user.dto.response;

import java.time.Instant;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        String avatar,
        boolean isSuperAdmin,
        boolean isActive,
        boolean twoFactorEnabled,
        Long roleId,
        String roleName,
        String roleSlug,
        String department,
        String timezone,
        String bio,
        String socialX,
        String socialLinkedIn,
        Instant lastLoginAt,
        String lastLoginIp,
        Integer loginCount,
        Instant passwordUpdatedAt,
        Instant createdAt,
        Instant updatedAt
) {}
