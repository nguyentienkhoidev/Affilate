package com.bargorya.portal.modules.menu.service;

import com.bargorya.portal.modules.menu.dto.request.MenuRequest;
import com.bargorya.portal.modules.menu.dto.response.MenuResponse;

import java.util.List;

public interface MenuService {
    List<MenuResponse> getPublicMenus(String position);
    List<MenuResponse> getAllMenus(String position);
    MenuResponse getMenuById(Long id);
    MenuResponse createMenu(MenuRequest request);
    MenuResponse updateMenu(Long id, MenuRequest request);
    void deleteMenu(Long id);
}
