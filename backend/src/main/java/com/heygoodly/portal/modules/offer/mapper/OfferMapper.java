package com.heygoodly.portal.modules.offer.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.mapper.BaseMapper;
import com.heygoodly.portal.modules.offer.dto.response.OfferResponse;
import com.heygoodly.portal.modules.offer.entity.OfferEntity;
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
 * Dedicated mapper component for Offers and Coupons.
 * Utilizes Stream API, Generics, lambda expressions, and method references.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OfferMapper implements BaseMapper<OfferEntity, OfferResponse, OfferResponse> {

    private final ObjectMapper objectMapper;

    @Override
    public OfferResponse toDetailResponse(OfferEntity o) {
        return toResponse(o, null, 0L);
    }

    @Override
    public OfferResponse toSummaryResponse(OfferEntity o) {
        return toDetailResponse(o);
    }

    public OfferResponse toResponse(OfferEntity o, StoreEntity store, long usesCount) {
        if (Objects.isNull(o)) {
            return null;
        }

        List<String> tags = deserializeJson(o.getTags());

        return new OfferResponse(
                o.getId(),
                o.getStoreId(),
                Objects.nonNull(store) ? store.getName() : null,
                Objects.nonNull(store) ? store.getSlug() : null,
                Objects.nonNull(store) ? store.getLogo() : null,
                o.getImage(),
                o.getName(),
                o.getDiscountValue(),
                o.getCode(),
                o.getUrlRef(),
                o.getDescription(),
                Boolean.TRUE.equals(o.getIsVerified()),
                Boolean.TRUE.equals(o.getIsActive()),
                Objects.nonNull(o.getSortOrder()) ? o.getSortOrder() : AppConstants.DEFAULT_SORT_ORDER,
                o.getExpireAt(),
                usesCount,
                CollectionUtils.isEmpty(tags) ? Collections.emptyList() : tags
        );
    }

    public List<String> deserializeJson(String json) {
        if (!StringUtils.hasText(json)) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            log.warn("Failed to deserialize offer tags json: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}

