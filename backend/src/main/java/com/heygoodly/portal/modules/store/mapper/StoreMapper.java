package com.heygoodly.portal.modules.store.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heygoodly.portal.common.mapper.BaseMapper;
import com.heygoodly.portal.modules.store.dto.response.StoreDetailResponse;
import com.heygoodly.portal.modules.store.dto.response.StoreSummaryResponse;
import com.heygoodly.portal.modules.store.entity.StoreEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Dedicated mapper for Store merchant entities.
 * Implements BaseMapper and utilizes Stream API, lambda expressions, and method references.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StoreMapper implements BaseMapper<StoreEntity, StoreDetailResponse, StoreSummaryResponse> {

    private final ObjectMapper objectMapper;

    @Override
    public StoreDetailResponse toDetailResponse(StoreEntity s) {
        return toDetailResponse(s, null);
    }

    public StoreDetailResponse toDetailResponse(StoreEntity s, String categoryName) {
        if (Objects.isNull(s)) {
            return null;
        }

        List<String> popularSearches = deserializeJson(s.getPopularSearches(), new TypeReference<List<String>>() {});
        List<StoreDetailResponse.StoreFaqDto> faqs = deserializeJson(s.getFaqs(), new TypeReference<List<StoreDetailResponse.StoreFaqDto>>() {});
        List<String> tags = deserializeJson(s.getTags(), new TypeReference<List<String>>() {});

        return new StoreDetailResponse(
                s.getId(),
                s.getName(),
                s.getSlug(),
                s.getLogo(),
                s.getSocialCardImage(),
                s.getSocialTitle(),
                s.getSocialDescription(),
                s.getAboutStore(),
                s.getCategoryId(),
                categoryName,
                s.getMaxOffer(),
                Boolean.TRUE.equals(s.getIsActive()),
                Boolean.TRUE.equals(s.getIsSearchable()),
                Boolean.TRUE.equals(s.getIsFeatured()),
                s.getRatingScore(),
                s.getRatingCount(),
                s.getAfWebsite(),
                s.getAfStatus(),
                s.getAfVisitCount(),
                s.getAfPortalUrl(),
                s.getAfAccount(),
                s.getAfCommission(),
                s.getInternalNote(),
                s.getAdsStatus(),
                s.getAdsAccount(),
                s.getMetaTitle(),
                s.getMetaKeywords(),
                s.getMetaDescription(),
                CollectionUtils.isEmpty(popularSearches) ? Collections.emptyList() : popularSearches,
                CollectionUtils.isEmpty(faqs) ? Collections.emptyList() : faqs,
                CollectionUtils.isEmpty(tags) ? Collections.emptyList() : tags
        );
    }

    @Override
    public StoreSummaryResponse toSummaryResponse(StoreEntity s) {
        return toSummaryResponse(s, 0L, null);
    }

    public StoreSummaryResponse toSummaryResponse(StoreEntity s, Long activeOffers, String categoryName) {
        if (Objects.isNull(s)) {
            return null;
        }

        List<String> tags = deserializeJson(s.getTags(), new TypeReference<List<String>>() {});

        return new StoreSummaryResponse(
                s.getId(),
                s.getName(),
                s.getSlug(),
                s.getLogo(),
                s.getCategoryId(),
                categoryName,
                s.getMaxOffer(),
                s.getRatingScore(),
                s.getRatingCount(),
                s.getAfWebsite(),
                s.getAfVisitCount(),
                s.getAfCommission(),
                s.getAfStatus(),
                s.getAdsStatus(),
                Boolean.TRUE.equals(s.getIsActive()),
                Boolean.TRUE.equals(s.getIsFeatured()),
                Objects.nonNull(activeOffers) ? activeOffers : 0L,
                CollectionUtils.isEmpty(tags) ? Collections.emptyList() : tags
        );
    }

    private <T> T deserializeJson(String json, TypeReference<T> typeRef) {
        if (!StringUtils.hasText(json)) {
            return null;
        }
        try {
            return objectMapper.readValue(json, typeRef);
        } catch (Exception e) {
            log.warn("Failed to deserialize store json: {}", e.getMessage());
            return null;
        }
    }
}

