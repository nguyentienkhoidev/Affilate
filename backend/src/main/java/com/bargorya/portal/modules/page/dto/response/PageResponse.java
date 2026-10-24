package com.bargorya.portal.modules.page.dto.response;

import java.time.Instant;

public record PageResponse(
        Long id,
        String title,
        String slug,
        String image,
        String content,
        boolean isActive,
        int sortOrder,
        String metaTitle,
        String metaDescription,
        Instant createdAt,
        Instant updatedAt
) {}
