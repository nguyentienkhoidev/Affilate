package com.heygoodly.portal.modules.setting.controller;

import com.heygoodly.portal.common.constant.MessageConstants;
import com.heygoodly.portal.common.constant.PermissionConstants;
import com.heygoodly.portal.common.dto.ApiResponse;
import com.heygoodly.portal.modules.role.enums.RoleCode;
import com.heygoodly.portal.modules.setting.dto.request.SettingRequest;
import com.heygoodly.portal.modules.setting.dto.response.SettingResponse;
import com.heygoodly.portal.modules.setting.service.SettingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/settings")
@RequiredArgsConstructor
public class SettingAdminController {

    private final SettingService settingService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<SettingResponse>> getAllSettings() {
        return ResponseEntity.ok(ApiResponse.success(settingService.getAllSettings()));
    }

    @PutMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.SETTING_GENERAL + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<SettingResponse>> updateSettings(@Valid @RequestBody SettingRequest request) {
        SettingResponse response = settingService.updateSettings(request.getSettings());
        return ResponseEntity.ok(ApiResponse.success(response, MessageConstants.UPDATED_SUCCESS));
    }
}
