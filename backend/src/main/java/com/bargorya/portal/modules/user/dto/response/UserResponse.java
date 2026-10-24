package com.bargorya.portal.modules.user.dto.response;

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
        Instant createdAt,
        Instant updatedAt
) {}
