package com.bargorya.portal.modules.menu.dto.response;

import java.time.Instant;
import java.util.List;

public record MenuResponse(
        Long id,
        Long parentId,
        String position,
        String title,
        String targetType,
        String targetValue,
        String imageIcon,
        int sortOrder,
        boolean isActive,
        List<MenuResponse> children,
        Instant createdAt,
        Instant updatedAt
) {}
