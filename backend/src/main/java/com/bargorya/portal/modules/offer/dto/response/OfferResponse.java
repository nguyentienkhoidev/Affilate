package com.bargorya.portal.modules.offer.dto.response;

import java.time.Instant;

public record OfferResponse(
        Long id,
        Long storeId,
        String storeName,
        String storeSlug,
        String name,
        String discountValue,
        String code,
        String urlRef,
        String description,
        boolean isVerified,
        boolean isActive,
        int sortOrder,
        Instant expireAt
) {}
