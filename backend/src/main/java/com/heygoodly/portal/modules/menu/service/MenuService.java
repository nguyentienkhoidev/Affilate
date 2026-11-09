package com.heygoodly.portal.modules.menu.service;

import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.modules.menu.dto.request.MenuRequest;
import com.heygoodly.portal.modules.menu.dto.response.MenuResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MenuService {
    List<MenuResponse> getPublicMenus(String position);
    List<MenuResponse> getAllMenus(String position);
    PageResponse<MenuResponse> getMenus(Pageable pageable, String position);
    MenuResponse getMenuById(Long id);
    MenuResponse createMenu(MenuRequest request);
    MenuResponse updateMenu(Long id, MenuRequest request);
    void deleteMenu(Long id);
}
