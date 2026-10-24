package com.bargorya.portal.modules.role.dto.response;

import java.util.List;

public record RoleResponse(
        Long id,
        String name,
        String slug,
        String description,
        boolean isSystem,
        long usersCount,
        List<String> permissions
) {}
