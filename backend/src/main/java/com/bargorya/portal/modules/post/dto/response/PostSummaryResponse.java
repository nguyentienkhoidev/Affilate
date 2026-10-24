package com.bargorya.portal.modules.post.dto.response;

import java.time.Instant;

public record PostSummaryResponse(
        Long id,
        String title,
        String slug,
        String image,
        String excerpt,
        Long categoryId,
        String categoryName,
        String authorName,
        boolean isFeatured,
        boolean isActive,
        Instant publishedAt,
        long viewCount
) {}
