package com.bargorya.portal.modules.page.dto.response;

import java.time.Instant;

public record PageSummaryResponse(
        Long id,
        String title,
        String slug,
        String image,
        boolean isActive,
        int sortOrder,
        Instant createdAt,
        Instant updatedAt
) {}
