package com.bargorya.portal.modules.store.dto.response;

import java.math.BigDecimal;

public record StoreDetailResponse(
        Long id,
        String name,
        String slug,
        String logo,
        String socialCardImage,
        String socialTitle,
        String socialDescription,
        String aboutStore,
        Long categoryId,
        String categoryName,
        Integer maxOffer,
        boolean isActive,
        boolean isSearchable,
        BigDecimal ratingScore,
        Integer ratingCount,
        String afWebsite,
        String afStatus,
        String afNetwork,
        Long afVisitCount,
        String afPortalUrl,
        String afAccount,
        String afCommission,
        String internalNote,
        String adsStatus,
        String adsAccount,
        String metaTitle,
        String metaKeywords,
        String metaDescription
) {}
