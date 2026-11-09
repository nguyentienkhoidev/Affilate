package com.heygoodly.portal.modules.page.mapper;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.mapper.BaseMapper;
import com.heygoodly.portal.modules.page.dto.response.PageResponse;
import com.heygoodly.portal.modules.page.dto.response.PageSummaryResponse;
import com.heygoodly.portal.modules.page.entity.PageEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Objects;

/**
 * Dedicated mapper for CMS editorial Page entities.
 * Implements BaseMapper and utilizes Stream API, lambda expressions, and method references.
 */
@Slf4j
@Component
public class PageMapper implements BaseMapper<PageEntity, PageResponse, PageSummaryResponse> {

    @Override
    public PageResponse toDetailResponse(PageEntity entity) {
        if (Objects.isNull(entity)) {
            return null;
        }

        int sortOrder = Objects.nonNull(entity.getSortOrder()) ? entity.getSortOrder() : AppConstants.DEFAULT_SORT_ORDER;
        boolean active = Boolean.TRUE.equals(entity.getIsActive());

        return new PageResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getSlug(),
                entity.getImage(),
                entity.getContent(),
                active,
                sortOrder,
                entity.getMetaTitle(),
                entity.getMetaDescription(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    @Override
    public PageSummaryResponse toSummaryResponse(PageEntity entity) {
        if (Objects.isNull(entity)) {
            return null;
        }

        int sortOrder = Objects.nonNull(entity.getSortOrder()) ? entity.getSortOrder() : AppConstants.DEFAULT_SORT_ORDER;
        boolean active = Boolean.TRUE.equals(entity.getIsActive());

        return new PageSummaryResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getSlug(),
                entity.getImage(),
                active,
                sortOrder,
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}

