package com.bargorya.portal.modules.store.dto.response;

import java.math.BigDecimal;

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
        String afNetwork,
        String adsStatus,
        boolean isActive,
        long activeOffersCount
) {}
