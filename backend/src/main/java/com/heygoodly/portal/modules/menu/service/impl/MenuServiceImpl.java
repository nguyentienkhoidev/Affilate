package com.heygoodly.portal.modules.menu.service.impl;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.constant.EntityFieldConstants;
import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.common.exception.BadRequestException;
import com.heygoodly.portal.common.exception.ResourceNotFoundException;
import com.heygoodly.portal.common.util.NullSafeUtils;
import com.heygoodly.portal.modules.menu.dto.request.MenuRequest;
import com.heygoodly.portal.modules.menu.dto.response.MenuResponse;
import com.heygoodly.portal.modules.menu.entity.MenuEntity;
import com.heygoodly.portal.modules.menu.mapper.MenuMapper;
import com.heygoodly.portal.modules.menu.repository.MenuRepository;
import com.heygoodly.portal.modules.menu.service.MenuService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class MenuServiceImpl implements MenuService {

    private final MenuRepository menuRepository;
    private final MenuMapper menuMapper;

    @Override
    @Transactional(readOnly = true)
    public List<MenuResponse> getPublicMenus(String position) {
        String pos = StringUtils.hasText(position) ? position.toLowerCase().trim() : AppConstants.DEFAULT_MENU_POSITION;
        log.info("Fetching public menus for position: {}", pos);
        List<MenuEntity> list = menuRepository.findByPositionAndIsActiveTrueOrderBySortOrderAsc(pos);
        return menuMapper.buildTree(list);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MenuResponse> getAllMenus(String position) {
        String pos = StringUtils.hasText(position) ? position.toLowerCase().trim() : AppConstants.DEFAULT_MENU_POSITION;
        log.info("Fetching all admin menus for position: {}", pos);
        List<MenuEntity> list = menuRepository.findByPositionOrderBySortOrderAsc(pos);
        return menuMapper.buildTree(list);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MenuResponse> getMenus(Pageable pageable, String position) {
        String pos = StringUtils.hasText(position) ? position.toLowerCase().trim() : AppConstants.DEFAULT_MENU_POSITION;
        log.info("Fetching paged menus for position: {}, page: {}", pos, pageable.getPageNumber());
        Page<MenuEntity> page = menuRepository.findByPositionOrderBySortOrderAsc(pos, pageable);
        List<MenuResponse> content = page.getContent().stream()
                .map(m -> menuMapper.toResponse(m, Collections.emptyList()))
                .toList();
        return PageResponse.of(content, page.getNumber(), page.getSize(), page.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public MenuResponse getMenuById(Long id) {
        log.info("Fetching menu by id: {}", id);
        MenuEntity entity = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(EntityFieldConstants.ENTITY_MENU, EntityFieldConstants.ID, id));
        return menuMapper.toResponse(entity, Collections.emptyList());
    }

    @Override
    @Transactional
    public MenuResponse createMenu(MenuRequest request) {
        log.info("Creating menu item: title={}, position={}", request.getTitle(), request.getPosition());
        MenuEntity parent = null;
        if (Objects.nonNull(request.getParentId())) {
            parent = menuRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException(EntityFieldConstants.ENTITY_MENU, EntityFieldConstants.ID, request.getParentId()));
        }

        MenuEntity menu = MenuEntity.builder()
                .parent(parent)
                .position(NullSafeUtils.safeLowerTrim(request.getPosition()))
                .title(NullSafeUtils.safeTrim(request.getTitle()))
                .targetType(NullSafeUtils.safeLowerTrim(request.getTargetType()))
                .targetValue(NullSafeUtils.safeTrim(request.getTargetValue()))
                .imageIcon(request.getImageIcon())
                .sortOrder(Objects.nonNull(request.getSortOrder()) ? request.getSortOrder() : AppConstants.DEFAULT_SORT_ORDER)
                .isActive(Objects.nonNull(request.getIsActive()) ? request.getIsActive() : true)
                .build();

        MenuEntity saved = menuRepository.save(menu);
        log.info("Successfully created menu item id={}", saved.getId());
        return menuMapper.toResponse(saved, Collections.emptyList());
    }

    @Override
    @Transactional
    public MenuResponse updateMenu(Long id, MenuRequest request) {
        log.info("Updating menu item id={}", id);
        MenuEntity entity = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(EntityFieldConstants.ENTITY_MENU, EntityFieldConstants.ID, id));

        MenuEntity parent = null;
        if (Objects.nonNull(request.getParentId())) {
            if (request.getParentId().equals(id)) {
                throw new BadRequestException("Menu item cannot be its own parent.");
            }
            parent = menuRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException(EntityFieldConstants.ENTITY_MENU, EntityFieldConstants.ID, request.getParentId()));
        }

        entity.setParent(parent);
        entity.setPosition(NullSafeUtils.safeLowerTrim(request.getPosition()));
        entity.setTitle(NullSafeUtils.safeTrim(request.getTitle()));
        entity.setTargetType(NullSafeUtils.safeLowerTrim(request.getTargetType()));
        entity.setTargetValue(NullSafeUtils.safeTrim(request.getTargetValue()));
        entity.setImageIcon(request.getImageIcon());
        if (Objects.nonNull(request.getSortOrder())) {
            entity.setSortOrder(request.getSortOrder());
        }
        if (Objects.nonNull(request.getIsActive())) {
            entity.setIsActive(request.getIsActive());
        }

        MenuEntity updated = menuRepository.save(entity);
        log.info("Successfully updated menu item id={}", updated.getId());
        return menuMapper.toResponse(updated, Collections.emptyList());
    }

    @Override
    @Transactional
    public void deleteMenu(Long id) {
        log.info("Deleting menu item id={}", id);
        MenuEntity entity = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(EntityFieldConstants.ENTITY_MENU, EntityFieldConstants.ID, id));
        menuRepository.delete(entity);
        log.info("Successfully deleted menu item id={}", id);
    }
}
