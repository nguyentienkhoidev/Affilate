package com.heygoodly.portal.modules.store.dto.response;

import java.math.BigDecimal;
import java.util.List;

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
        boolean isFeatured,
        BigDecimal ratingScore,
        Integer ratingCount,
        String afWebsite,
        String afStatus,
        Long afVisitCount,
        String afPortalUrl,
        String afAccount,
        String afCommission,
        String internalNote,
        String adsStatus,
        String adsAccount,
        String metaTitle,
        String metaKeywords,
        String metaDescription,
        List<String> popularSearches,
        List<StoreFaqDto> faqs,
        List<String> tags,
        RatingBreakdownDto ratingBreakdown,
        List<StoreReviewDto> customerReviews
) {
    public record StoreFaqDto(String question, String answer) {}

    public record RatingBreakdownDto(
            Integer fiveStar,
            Integer fourStar,
            Integer threeStar,
            Integer twoStar,
            Integer oneStar
    ) {}

    public record StoreReviewDto(
            Long id,
            Long reviewerProfileId,
            String reviewerName,
            String reviewerAvatar,
            boolean isVerified,
            Integer rating,
            String reviewDateLabel,
            String comment,
            Integer sortOrder,
            boolean isActive
    ) {}
}
