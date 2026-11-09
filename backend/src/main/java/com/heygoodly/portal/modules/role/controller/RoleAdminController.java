package com.heygoodly.portal.modules.role.controller;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.constant.EntityFieldConstants;
import com.heygoodly.portal.common.constant.MessageConstants;
import com.heygoodly.portal.common.constant.PermissionConstants;
import com.heygoodly.portal.common.dto.ApiResponse;
import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.common.util.PaginationUtils;
import com.heygoodly.portal.modules.role.dto.request.RoleRequest;
import com.heygoodly.portal.modules.role.dto.response.PermissionResponse;
import com.heygoodly.portal.modules.role.dto.response.RoleResponse;
import com.heygoodly.portal.modules.role.enums.RoleCode;
import com.heygoodly.portal.modules.role.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
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
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/roles")
@RequiredArgsConstructor
public class RoleAdminController {

    private final RoleService roleService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<RoleResponse>>> list(
            @RequestParam(value = "page", required = false, defaultValue = AppConstants.DEFAULT_PAGE_NUMBER_STR) Integer page,
            @RequestParam(value = "size", required = false, defaultValue = AppConstants.DEFAULT_PAGE_SIZE_STR) Integer size,
            @RequestParam(value = "search", required = false) String search
    ) {
        Pageable pageable = PaginationUtils.createPageable(page, size, EntityFieldConstants.ID, AppConstants.DEFAULT_SORT_DIRECTION_ASC);
        PageResponse<RoleResponse> result = roleService.getRoles(pageable, search);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/permissions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, List<PermissionResponse>>>> getPermissions() {
        return ResponseEntity.ok(ApiResponse.success(roleService.getPermissionsGrouped()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<RoleResponse>> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.success(roleService.getRoleById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.ROLE_CREATE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<RoleResponse>> create(@Valid @RequestBody RoleRequest request) {
        RoleResponse created = roleService.createRole(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, MessageConstants.CREATED_SUCCESS));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.ROLE_UPDATE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<RoleResponse>> update(
            @PathVariable("id") Long id,
            @Valid @RequestBody RoleRequest request
    ) {
        RoleResponse updated = roleService.updateRole(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, MessageConstants.UPDATED_SUCCESS));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.ROLE_DELETE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable("id") Long id) {
        roleService.deleteRole(id);
        return ResponseEntity.ok(ApiResponse.success(null, MessageConstants.DELETED_SUCCESS));
    }
}
