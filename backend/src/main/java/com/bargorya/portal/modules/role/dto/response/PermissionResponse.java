package com.bargorya.portal.modules.role.dto.response;

public record PermissionResponse(
        Long id,
        String module,
        String action,
        String code,
        String name,
        String description
) {}
