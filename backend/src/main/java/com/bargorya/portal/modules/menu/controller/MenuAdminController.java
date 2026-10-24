package com.bargorya.portal.modules.menu.controller;

import com.bargorya.portal.common.constant.MessageConstants;
import com.bargorya.portal.common.constant.PermissionConstants;
import com.bargorya.portal.common.dto.ApiResponse;
import com.bargorya.portal.modules.menu.dto.request.MenuRequest;
import com.bargorya.portal.modules.menu.dto.response.MenuResponse;
import com.bargorya.portal.modules.menu.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/menus")
@RequiredArgsConstructor
public class MenuAdminController {

    private final MenuService menuService;

    @GetMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.MENU_MANAGE + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<MenuResponse>>> list(
            @RequestParam(value = "position", required = false, defaultValue = "main") String position) {
        return ResponseEntity.ok(ApiResponse.success(menuService.getAllMenus(position)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.MENU_MANAGE + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<MenuResponse>> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.success(menuService.getMenuById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.MENU_MANAGE + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<MenuResponse>> create(@Valid @RequestBody MenuRequest request) {
        MenuResponse created = menuService.createMenu(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, MessageConstants.CREATED_SUCCESS));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.MENU_MANAGE + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<MenuResponse>> update(
            @PathVariable("id") Long id,
            @Valid @RequestBody MenuRequest request) {
        MenuResponse updated = menuService.updateMenu(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, MessageConstants.UPDATED_SUCCESS));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.MENU_MANAGE + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable("id") Long id) {
        menuService.deleteMenu(id);
        return ResponseEntity.ok(ApiResponse.success(null, MessageConstants.DELETED_SUCCESS));
    }
}
