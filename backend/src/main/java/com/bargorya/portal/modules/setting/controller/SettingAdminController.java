package com.bargorya.portal.modules.setting.controller;

import com.bargorya.portal.common.constant.MessageConstants;
import com.bargorya.portal.common.constant.PermissionConstants;
import com.bargorya.portal.common.dto.ApiResponse;
import com.bargorya.portal.modules.setting.dto.request.SettingRequest;
import com.bargorya.portal.modules.setting.dto.response.SettingResponse;
import com.bargorya.portal.modules.setting.service.SettingService;
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
    @PreAuthorize("hasAuthority('" + PermissionConstants.SETTING_GENERAL + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<SettingResponse>> getAllSettings() {
        return ResponseEntity.ok(ApiResponse.success(settingService.getAllSettings()));
    }

    @PutMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.SETTING_GENERAL + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<SettingResponse>> updateSettings(@Valid @RequestBody SettingRequest request) {
        SettingResponse response = settingService.updateSettings(request.getSettings());
        return ResponseEntity.ok(ApiResponse.success(response, MessageConstants.UPDATED_SUCCESS));
    }
}
