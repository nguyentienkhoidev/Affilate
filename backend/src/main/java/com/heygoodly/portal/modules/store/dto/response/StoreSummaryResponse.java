package com.heygoodly.portal.modules.store.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record StoreSummaryResponse(
        Long id,
        String name,
        String slug,
        String logo,
        Long categoryId,
        String categoryName,
        Integer maxOffer,
        BigDecimal ratingScore,
        Integer ratingCount,
        String afWebsite,
        Long afVisitCount,
        String afCommission,
        String afStatus,
        String adsStatus,
        boolean isActive,
        boolean isFeatured,
        long activeOffersCount,
        List<String> tags
) {}
