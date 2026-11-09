package com.heygoodly.portal.modules.user.dto.response;

public record UserSummaryResponse(
        Long id,
        String fullName,
        String email,
        String roleName,
        String roleSlug,
        String avatar,
        boolean isSuperAdmin,
        boolean twoFactorEnabled
) {}
