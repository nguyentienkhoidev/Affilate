package com.bargorya.portal.modules.setting.service.impl;

import com.bargorya.portal.modules.setting.dto.response.SettingResponse;
import com.bargorya.portal.modules.setting.entity.SystemSettingEntity;
import com.bargorya.portal.modules.setting.repository.SystemSettingRepository;
import com.bargorya.portal.modules.setting.service.SettingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettingServiceImpl implements SettingService {

    private final SystemSettingRepository settingRepository;

    private static final Set<String> PUBLIC_KEYS = Set.of(
            "site_name",
            "site_tagline",
            "site_logo",
            "site_favicon",
            "contact_email",
            "contact_hotline",
            "contact_address",
            "default_meta_title",
            "default_meta_description",
            "partnerboost_meta_tag",
            "impact_meta_tag",
            "gtag_id",
            "gtm_id",
            "header_ads_banner_img",
            "header_ads_banner_url",
            "social_facebook",
            "social_twitter",
            "social_youtube",
            "social_tiktok"
    );

    @Override
    @Transactional(readOnly = true)
    public SettingResponse getAllSettings() {
        Map<String, String> map = settingRepository.findAll().stream()
                .collect(Collectors.toMap(
                        SystemSettingEntity::getSettingKey,
                        e -> e.getSettingValue() != null ? e.getSettingValue() : "",
                        (v1, v2) -> v2
                ));
        return new SettingResponse(map);
    }

    @Override
    @Transactional(readOnly = true)
    public SettingResponse getPublicSettings() {
        Map<String, String> map = settingRepository.findAll().stream()
                .filter(e -> PUBLIC_KEYS.contains(e.getSettingKey()))
                .collect(Collectors.toMap(
                        SystemSettingEntity::getSettingKey,
                        e -> e.getSettingValue() != null ? e.getSettingValue() : "",
                        (v1, v2) -> v2
                ));
        return new SettingResponse(map);
    }

    @Override
    @Transactional
    public SettingResponse updateSettings(Map<String, String> settings) {
        if (settings == null || settings.isEmpty()) {
            return getAllSettings();
        }

        List<SystemSettingEntity> existing = settingRepository.findAll();
        Map<String, SystemSettingEntity> existingMap = existing.stream()
                .collect(Collectors.toMap(SystemSettingEntity::getSettingKey, e -> e));

        Map<String, String> updatedMap = new HashMap<>();

        for (Map.Entry<String, String> entry : settings.entrySet()) {
            String key = entry.getKey().trim();
            String value = entry.getValue() != null ? entry.getValue().trim() : "";

            SystemSettingEntity entity = existingMap.get(key);
            if (entity != null) {
                entity.setSettingValue(value);
                settingRepository.save(entity);
            } else {
                entity = SystemSettingEntity.builder()
                        .settingKey(key)
                        .settingValue(value)
                        .build();
                settingRepository.save(entity);
            }
            updatedMap.put(key, value);
        }

        log.info("Updated {} system settings", settings.size());
        return getAllSettings();
    }

    @Override
    @Transactional(readOnly = true)
    public String getSettingValue(String key, String defaultValue) {
        return settingRepository.findBySettingKey(key)
                .map(SystemSettingEntity::getSettingValue)
                .filter(v -> !v.isBlank())
                .orElse(defaultValue);
    }
}
