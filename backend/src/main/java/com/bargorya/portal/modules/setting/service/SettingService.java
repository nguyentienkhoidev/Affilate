package com.bargorya.portal.modules.setting.service;

import com.bargorya.portal.modules.setting.dto.response.SettingResponse;

import java.util.Map;

public interface SettingService {
    SettingResponse getAllSettings();
    SettingResponse getPublicSettings();
    SettingResponse updateSettings(Map<String, String> settings);
    String getSettingValue(String key, String defaultValue);
}
