package com.bargorya.portal.modules.menu.controller;

import com.bargorya.portal.common.dto.ApiResponse;
import com.bargorya.portal.modules.menu.dto.response.MenuResponse;
import com.bargorya.portal.modules.menu.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/menus")
@RequiredArgsConstructor
public class MenuPublicController {

    private final MenuService menuService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MenuResponse>>> getMenus(
            @RequestParam(value = "position", required = false, defaultValue = "main") String position) {
        return ResponseEntity.ok(ApiResponse.success(menuService.getPublicMenus(position)));
    }
}
