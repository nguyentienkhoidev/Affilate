package com.heygoodly.portal.modules.menu.mapper;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.mapper.BaseMapper;
import com.heygoodly.portal.modules.menu.dto.response.MenuResponse;
import com.heygoodly.portal.modules.menu.entity.MenuEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Dedicated mapper for navigation menu entities.
 * Implements BaseMapper and utilizes Stream API, lambda expressions, and method references.
 */
@Slf4j
@Component
public class MenuMapper implements BaseMapper<MenuEntity, MenuResponse, MenuResponse> {

    @Override
    public MenuResponse toDetailResponse(MenuEntity entity) {
        return toResponse(entity, Collections.emptyList());
    }

    @Override
    public MenuResponse toSummaryResponse(MenuEntity entity) {
        return toResponse(entity, Collections.emptyList());
    }

    public MenuResponse toResponse(MenuEntity entity, List<MenuResponse> children) {
        if (Objects.isNull(entity)) {
            return null;
        }

        Long parentId = Objects.nonNull(entity.getParent()) ? entity.getParent().getId() : null;
        int sortOrder = Objects.nonNull(entity.getSortOrder()) ? entity.getSortOrder() : AppConstants.DEFAULT_SORT_ORDER;
        boolean active = Boolean.TRUE.equals(entity.getIsActive());
        List<MenuResponse> childList = Objects.nonNull(children) ? children : new ArrayList<>();

        return new MenuResponse(
                entity.getId(),
                parentId,
                entity.getPosition(),
                entity.getTitle(),
                entity.getTargetType(),
                entity.getTargetValue(),
                entity.getImageIcon(),
                sortOrder,
                active,
                childList,
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public List<MenuResponse> buildTree(List<MenuEntity> allItems) {
        if (CollectionUtils.isEmpty(allItems)) {
            return Collections.emptyList();
        }

        Map<Long, List<MenuEntity>> childrenByParentId = allItems.stream()
                .filter(m -> Objects.nonNull(m.getParent()) && Objects.nonNull(m.getParent().getId()))
                .collect(Collectors.groupingBy(m -> m.getParent().getId()));

        return allItems.stream()
                .filter(m -> Objects.isNull(m.getParent()))
                .sorted(Comparator.comparingInt(m -> Objects.nonNull(m.getSortOrder()) ? m.getSortOrder() : AppConstants.DEFAULT_SORT_ORDER))
                .map(root -> mapRecursively(root, childrenByParentId))
                .toList();
    }

    private MenuResponse mapRecursively(MenuEntity parent, Map<Long, List<MenuEntity>> childrenMap) {
        List<MenuEntity> children = childrenMap.getOrDefault(parent.getId(), Collections.emptyList());
        List<MenuResponse> childResponses = children.stream()
                .sorted(Comparator.comparingInt(m -> Objects.nonNull(m.getSortOrder()) ? m.getSortOrder() : AppConstants.DEFAULT_SORT_ORDER))
                .map(child -> mapRecursively(child, childrenMap))
                .toList();

        return toResponse(parent, childResponses);
    }
}

