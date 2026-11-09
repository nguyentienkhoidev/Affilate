package com.heygoodly.portal.modules.tag.mapper;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.mapper.BaseMapper;
import com.heygoodly.portal.modules.tag.dto.TagResponse;
import com.heygoodly.portal.modules.tag.entity.TagEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Objects;

/**
 * Dedicated mapper for Tag taxonomy entities.
 * Implements BaseMapper and utilizes Stream API, lambda expressions, and method references.
 */
@Slf4j
@Component
public class TagMapper implements BaseMapper<TagEntity, TagResponse, TagResponse> {

    @Override
    public TagResponse toDetailResponse(TagEntity entity) {
        return toResponseWithCounts(entity, 0L, 0L, 0L, 0L);
    }

    @Override
    public TagResponse toSummaryResponse(TagEntity entity) {
        return toDetailResponse(entity);
    }

    public TagResponse toResponseWithCounts(
            TagEntity entity,
            Long postsCount,
            Long storesCount,
            Long offersCount,
            Long mediaCount
    ) {
        if (Objects.isNull(entity)) {
            return null;
        }

        long safePosts = Objects.nonNull(postsCount) ? postsCount : 0L;
        long safeStores = Objects.nonNull(storesCount) ? storesCount : 0L;
        long safeOffers = Objects.nonNull(offersCount) ? offersCount : 0L;
        long safeMedia = Objects.nonNull(mediaCount) ? mediaCount : 0L;
        long totalUsage = safePosts + safeStores + safeOffers + safeMedia;

        return TagResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .slug(entity.getSlug())
                .description(entity.getDescription())
                .color(StringUtils.hasText(entity.getColor()) ? entity.getColor() : AppConstants.DEFAULT_TAG_COLOR)
                .isFeatured(Boolean.TRUE.equals(entity.getIsFeatured()))
                .isActive(Boolean.TRUE.equals(entity.getIsActive()))
                .postsCount(safePosts)
                .storesCount(safeStores)
                .offersCount(safeOffers)
                .mediaCount(safeMedia)
                .totalUsageCount(totalUsage)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}

