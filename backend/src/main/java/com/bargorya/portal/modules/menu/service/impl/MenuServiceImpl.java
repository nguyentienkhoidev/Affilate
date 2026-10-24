package com.bargorya.portal.modules.menu.service.impl;

import com.bargorya.portal.common.exception.ResourceNotFoundException;
import com.bargorya.portal.modules.menu.dto.request.MenuRequest;
import com.bargorya.portal.modules.menu.dto.response.MenuResponse;
import com.bargorya.portal.modules.menu.entity.MenuEntity;
import com.bargorya.portal.modules.menu.repository.MenuRepository;
import com.bargorya.portal.modules.menu.service.MenuService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MenuServiceImpl implements MenuService {

    private final MenuRepository menuRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MenuResponse> getPublicMenus(String position) {
        String pos = (position != null && !position.isBlank()) ? position.toLowerCase().trim() : "main";
        List<MenuEntity> list = menuRepository.findByPositionAndIsActiveTrueOrderBySortOrderAsc(pos);
        return buildTree(list);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MenuResponse> getAllMenus(String position) {
        String pos = (position != null && !position.isBlank()) ? position.toLowerCase().trim() : "main";
        List<MenuEntity> list = menuRepository.findByPositionOrderBySortOrderAsc(pos);
        return buildTree(list);
    }

    @Override
    @Transactional(readOnly = true)
    public MenuResponse getMenuById(Long id) {
        MenuEntity entity = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));
        return mapToResponse(entity, Collections.emptyList());
    }

    @Override
    @Transactional
    public MenuResponse createMenu(MenuRequest request) {
        MenuEntity parent = null;
        if (request.getParentId() != null) {
            parent = menuRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent menu item not found with id: " + request.getParentId()));
        }

        MenuEntity menu = MenuEntity.builder()
                .parent(parent)
                .position(request.getPosition().toLowerCase().trim())
                .title(request.getTitle().trim())
                .targetType(request.getTargetType().toLowerCase().trim())
                .targetValue(request.getTargetValue().trim())
                .imageIcon(request.getImageIcon())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 9999)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        MenuEntity saved = menuRepository.save(menu);
        return mapToResponse(saved, Collections.emptyList());
    }

    @Override
    @Transactional
    public MenuResponse updateMenu(Long id, MenuRequest request) {
        MenuEntity entity = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));

        MenuEntity parent = null;
        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new IllegalArgumentException("Menu item cannot be its own parent.");
            }
            parent = menuRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent menu item not found with id: " + request.getParentId()));
        }

        entity.setParent(parent);
        entity.setPosition(request.getPosition().toLowerCase().trim());
        entity.setTitle(request.getTitle().trim());
        entity.setTargetType(request.getTargetType().toLowerCase().trim());
        entity.setTargetValue(request.getTargetValue().trim());
        entity.setImageIcon(request.getImageIcon());
        if (request.getSortOrder() != null) {
            entity.setSortOrder(request.getSortOrder());
        }
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }

        MenuEntity updated = menuRepository.save(entity);
        return mapToResponse(updated, Collections.emptyList());
    }

    @Override
    @Transactional
    public void deleteMenu(Long id) {
        MenuEntity entity = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));
        menuRepository.delete(entity);
    }

    private List<MenuResponse> buildTree(List<MenuEntity> allItems) {
        Map<Long, List<MenuEntity>> childrenByParentId = allItems.stream()
                .filter(m -> m.getParent() != null)
                .collect(Collectors.groupingBy(m -> m.getParent().getId()));

        return allItems.stream()
                .filter(m -> m.getParent() == null)
                .sorted(Comparator.comparingInt(m -> m.getSortOrder() != null ? m.getSortOrder() : 9999))
                .map(root -> mapRecursively(root, childrenByParentId))
                .collect(Collectors.toList());
    }

    private MenuResponse mapRecursively(MenuEntity parent, Map<Long, List<MenuEntity>> childrenMap) {
        List<MenuEntity> children = childrenMap.getOrDefault(parent.getId(), Collections.emptyList());
        List<MenuResponse> childResponses = children.stream()
                .sorted(Comparator.comparingInt(m -> m.getSortOrder() != null ? m.getSortOrder() : 9999))
                .map(child -> mapRecursively(child, childrenMap))
                .collect(Collectors.toList());

        return mapToResponse(parent, childResponses);
    }

    private MenuResponse mapToResponse(MenuEntity entity, List<MenuResponse> children) {
        return new MenuResponse(
                entity.getId(),
                entity.getParent() != null ? entity.getParent().getId() : null,
                entity.getPosition(),
                entity.getTitle(),
                entity.getTargetType(),
                entity.getTargetValue(),
                entity.getImageIcon(),
                entity.getSortOrder() != null ? entity.getSortOrder() : 9999,
                Boolean.TRUE.equals(entity.getIsActive()),
                children != null ? children : new ArrayList<>(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
