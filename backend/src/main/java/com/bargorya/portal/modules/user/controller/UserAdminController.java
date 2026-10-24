package com.bargorya.portal.modules.user.controller;

import com.bargorya.portal.common.constant.MessageConstants;
import com.bargorya.portal.common.constant.PermissionConstants;
import com.bargorya.portal.common.dto.ApiResponse;
import com.bargorya.portal.common.dto.PageResponse;
import com.bargorya.portal.common.util.PaginationUtils;
import com.bargorya.portal.modules.user.dto.request.UserRequest;
import com.bargorya.portal.modules.user.dto.request.UserStatusRequest;
import com.bargorya.portal.modules.user.dto.response.UserResponse;
import com.bargorya.portal.modules.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class UserAdminController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_VIEW + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> list(
            @RequestParam(value = "page", required = false, defaultValue = "0") Integer page,
            @RequestParam(value = "size", required = false, defaultValue = "20") Integer size,
            @RequestParam(value = "sortBy", required = false, defaultValue = "id") String sortBy,
            @RequestParam(value = "direction", required = false, defaultValue = "desc") String direction,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "roleId", required = false) Long roleId,
            @RequestParam(value = "isActive", required = false) Boolean isActive
    ) {
        Pageable pageable = PaginationUtils.createPageable(page, size, sortBy, direction);
        PageResponse<UserResponse> result = userService.getUsers(pageable, search, roleId, isActive);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_VIEW + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_CREATE + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> create(@Valid @RequestBody UserRequest request) {
        UserResponse created = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, MessageConstants.CREATED_SUCCESS));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_UPDATE + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> update(
            @PathVariable("id") Long id,
            @Valid @RequestBody UserRequest request
    ) {
        UserResponse updated = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, MessageConstants.UPDATED_SUCCESS));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_DELETE + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable("id") Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, MessageConstants.DELETED_SUCCESS));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_UPDATE + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody UserStatusRequest request
    ) {
        userService.toggleUserStatus(id, request.getIsActive());
        return ResponseEntity.ok(ApiResponse.success(null, MessageConstants.UPDATED_SUCCESS));
    }

    @PostMapping("/{id}/reset-2fa")
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_2FA_RESET + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> reset2fa(@PathVariable("id") Long id) {
        userService.resetUser2fa(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Two-factor authentication has been reset."));
    }
}
