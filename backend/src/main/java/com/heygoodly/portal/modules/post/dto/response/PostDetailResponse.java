package com.heygoodly.portal.modules.post.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public record PostDetailResponse(
        Long id,
        String title,
        String slug,
        String image,
        String excerpt,
        String content,
        Long categoryId,
        String categoryName,
        String categorySlug,
        Long storeId,
        String storeSlug,
        String storeName,
        String authorName,
        String authorAvatar,
        String authorRole,
        String authorBio,
        String readTime,
        BigDecimal rating,
        List<String> tags,
        Map<String, Object> sidebarConfig,
        boolean isFeatured,
        boolean isActive,
        Instant publishedAt,
        long viewCount,
        String metaTitle,
        String metaKeywords,
        String metaDescription,
        String canonicalUrl,
        String status
) {}
