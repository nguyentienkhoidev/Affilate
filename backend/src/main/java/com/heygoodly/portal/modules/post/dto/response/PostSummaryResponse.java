package com.heygoodly.portal.modules.post.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record PostSummaryResponse(
        Long id,
        String title,
        String slug,
        String image,
        String excerpt,
        Long categoryId,
        String categoryName,
        String categorySlug,
        Long storeId,
        String storeSlug,
        String storeName,
        String authorName,
        String authorAvatar,
        String authorRole,
        String readTime,
        BigDecimal rating,
        List<String> tags,
        boolean isFeatured,
        boolean isActive,
        Instant publishedAt,
        long viewCount,
        String status
) {}
