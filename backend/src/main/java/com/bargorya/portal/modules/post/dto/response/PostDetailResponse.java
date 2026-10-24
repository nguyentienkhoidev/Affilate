package com.bargorya.portal.modules.post.dto.response;

import java.time.Instant;

public record PostDetailResponse(
        Long id,
        String title,
        String slug,
        String image,
        String excerpt,
        String content,
        Long categoryId,
        String categoryName,
        String authorName,
        boolean isFeatured,
        boolean isActive,
        Instant publishedAt,
        long viewCount,
        String metaTitle,
        String metaKeywords,
        String metaDescription
) {}
