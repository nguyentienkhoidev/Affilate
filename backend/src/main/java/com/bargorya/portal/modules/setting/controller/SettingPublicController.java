package com.bargorya.portal.modules.setting.controller;

import com.bargorya.portal.common.dto.ApiResponse;
import com.bargorya.portal.modules.setting.dto.response.SettingResponse;
import com.bargorya.portal.modules.setting.service.SettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class SettingPublicController {

    private final SettingService settingService;

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<SettingResponse>> getPublicSettings() {
        return ResponseEntity.ok(ApiResponse.success(settingService.getPublicSettings()));
    }
}
