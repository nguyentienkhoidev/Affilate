package com.heygoodly.portal.modules.user.controller;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.constant.EntityFieldConstants;
import com.heygoodly.portal.common.constant.MessageConstants;
import com.heygoodly.portal.common.constant.PermissionConstants;
import com.heygoodly.portal.common.dto.ApiResponse;
import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.common.util.PaginationUtils;
import com.heygoodly.portal.modules.role.enums.RoleCode;
import com.heygoodly.portal.modules.user.dto.request.UserCriteria;
import com.heygoodly.portal.modules.user.dto.request.UserLoginRecordRequest;
import com.heygoodly.portal.modules.user.dto.request.UserRequest;
import com.heygoodly.portal.modules.user.dto.request.UserStatusRequest;
import com.heygoodly.portal.modules.user.dto.response.UserLoginRecordResponse;
import com.heygoodly.portal.modules.user.dto.response.UserResponse;
import com.heygoodly.portal.modules.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class UserAdminController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> list(@ModelAttribute UserCriteria criteria) {
        Pageable pageable = criteria.toPageable();
        if (criteria.getRoleName() == null && criteria.getRole() != null) {
            criteria.setRoleName(criteria.getRole());
        }
        PageResponse<UserResponse> result = userService.getUsers(pageable, criteria);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserResponse>> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_CREATE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<UserResponse>> create(@Valid @RequestBody UserRequest request) {
        UserResponse created = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, MessageConstants.CREATED_SUCCESS));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_UPDATE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<UserResponse>> update(
            @PathVariable("id") Long id,
            @Valid @RequestBody UserRequest request
    ) {
        UserResponse updated = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, MessageConstants.UPDATED_SUCCESS));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_DELETE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable("id") Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, MessageConstants.DELETED_SUCCESS));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_UPDATE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody UserStatusRequest request
    ) {
        userService.toggleUserStatus(id, request.getIsActive());
        return ResponseEntity.ok(ApiResponse.success(null, MessageConstants.UPDATED_SUCCESS));
    }

    @PostMapping("/{id}/reset-2fa")
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_2FA_RESET + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<Void>> reset2fa(@PathVariable("id") Long id) {
        userService.resetUser2fa(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Two-factor authentication has been reset."));
    }

    @GetMapping("/{id}/logins")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<UserLoginRecordResponse>>> getUserLogins(@PathVariable("id") Long id) {
        List<UserLoginRecordResponse> records = userService.getUserLoginRecords(id);
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @PostMapping("/{id}/logins")
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_UPDATE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<UserLoginRecordResponse>> addLoginRecord(
            @PathVariable("id") Long id,
            @RequestBody UserLoginRecordRequest request
    ) {
        UserLoginRecordResponse record = userService.addUserLoginRecord(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(record, "Login record added successfully."));
    }

    @PutMapping("/{id}/logins/{recordId}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_UPDATE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<UserLoginRecordResponse>> updateLoginRecord(
            @PathVariable("id") Long id,
            @PathVariable("recordId") Long recordId,
            @RequestBody UserLoginRecordRequest request
    ) {
        UserLoginRecordResponse record = userService.updateUserLoginRecord(id, recordId, request);
        return ResponseEntity.ok(ApiResponse.success(record, "Login record updated successfully."));
    }

    @DeleteMapping("/{id}/logins/{recordId}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_UPDATE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<Void>> deleteLoginRecord(
            @PathVariable("id") Long id,
            @PathVariable("recordId") Long recordId
    ) {
        userService.deleteUserLoginRecord(id, recordId);
        return ResponseEntity.ok(ApiResponse.success(null, "Login record removed successfully."));
    }

    @DeleteMapping("/{id}/logins")
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_UPDATE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<Void>> deleteAllLoginRecords(@PathVariable("id") Long id) {
        userService.deleteAllUserLoginRecords(id);
        return ResponseEntity.ok(ApiResponse.success(null, "All login records cleared successfully."));
    }
}
