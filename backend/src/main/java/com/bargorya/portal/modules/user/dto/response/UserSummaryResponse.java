package com.bargorya.portal.modules.user.dto.response;

import java.util.List;

public record UserSummaryResponse(
        Long id,
        String fullName,
        String email,
        String roleName,
        String roleSlug,
        String avatar,
        boolean isSuperAdmin,
        boolean twoFactorEnabled,
        List<String> permissions
) {}
