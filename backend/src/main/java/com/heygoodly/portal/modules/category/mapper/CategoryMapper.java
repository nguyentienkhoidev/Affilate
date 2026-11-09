package com.heygoodly.portal.modules.category.mapper;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.mapper.BaseMapper;
import com.heygoodly.portal.common.util.NullSafeUtils;
import com.heygoodly.portal.modules.category.dto.response.CategoryResponse;
import com.heygoodly.portal.modules.category.entity.CategoryEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Objects;

/**
 * Dedicated mapper for Category entities.
 * Implements BaseMapper and utilizes Stream API, lambda expressions, and method references.
 */
@Slf4j
@Component
public class CategoryMapper implements BaseMapper<CategoryEntity, CategoryResponse, CategoryResponse> {

    @Override
    public CategoryResponse toDetailResponse(CategoryEntity entity) {
        return toResponse(entity, null, 0L, 0L);
    }

    @Override
    public CategoryResponse toSummaryResponse(CategoryEntity entity) {
        return toDetailResponse(entity);
    }

    public CategoryResponse toResponse(CategoryEntity entity, String parentName, long postCount, long storeCount) {
        if (Objects.isNull(entity)) {
            return null;
        }

        return new CategoryResponse(
                entity.getId(),
                entity.getName(),
                entity.getSlug(),
                entity.getType(),
                entity.getParentId(),
                parentName,
                entity.getImage(),
                NullSafeUtils.safeBoolean(entity.getIsActive()),
                NullSafeUtils.safeBoolean(entity.getShowOnHome()),
                NullSafeUtils.safeInt(entity.getSortOrder(), AppConstants.DEFAULT_SORT_ORDER),
                entity.getDescription(),
                entity.getMetaTitle(),
                entity.getMetaKeywords(),
                entity.getMetaDescription(),
                postCount,
                storeCount
        );
    }
}

