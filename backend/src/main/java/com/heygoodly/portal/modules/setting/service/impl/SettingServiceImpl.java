package com.heygoodly.portal.modules.setting.service.impl;

import com.heygoodly.portal.common.util.SecurityUtils;
import com.heygoodly.portal.modules.audit.dto.request.CreateAuditLogRequest;
import com.heygoodly.portal.modules.audit.service.AuditLogService;
import com.heygoodly.portal.modules.setting.dto.response.SettingResponse;
import com.heygoodly.portal.modules.setting.entity.SystemSettingEntity;
import com.heygoodly.portal.modules.setting.repository.SystemSettingRepository;
import com.heygoodly.portal.modules.setting.service.SettingService;
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
    private final AuditLogService auditLogService;

    private static final Set<String> PUBLIC_KEYS = Set.of(
            "site_name",
            "site_tagline",
            "site_slogan",
            "site_logo",
            "site_favicon",
            "footer_copyright",
            "contact_email",
            "contact_hotline",
            "contact_address",
            "meta_title",
            "meta_description",
            "default_meta_title",
            "default_meta_description",
            "google_meta",
            "bing_meta",
            "canonical_url",
            "og_image",
            "no_index",
            "gtag_id",
            "gtm_id",
            "facebook_pixel",
            "cloudflare_token",
            "header_ads_active",
            "header_ads_badge",
            "header_ads_subtitle",
            "header_ads_title",
            "header_ads_description",
            "header_ads_button_text",
            "header_ads_banner_url",
            "header_ads_banner_img",
            "affiliate_redirect_prefix",
            "affiliate_amazon_tag",
            "affiliate_impact_id",
            "affiliate_cj_id",
            "affiliate_shareasale_id",
            "affiliate_disclosure",
            "newsletter_enabled",
            "newsletter_eyebrow",
            "newsletter_title",
            "newsletter_description",
            "newsletter_placeholder",
            "newsletter_button_text",
            "newsletter_success_message",
            "newsletter_welcome_subject",
            "newsletter_double_optin",
            "partnerboost_meta_tag",
            "impact_meta_tag",
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

        // Record security audit trail
        try {
            String adminEmail = SecurityUtils.getCurrentUserEmail().orElse("admin@heygoodly.com");
            Long adminId = SecurityUtils.getCurrentUserId().orElse(null);
            auditLogService.recordLog(CreateAuditLogRequest.builder()
                    .userId(adminId)
                    .userEmail(adminEmail)
                    .action("UPDATE_SYSTEM_SETTINGS")
                    .module("settings")
                    .resourceId("system_settings")
                    .resourceName(String.format("Updated %d system configuration parameters", settings.size()))
                    .status("SUCCESS")
                    .build());
        } catch (Exception ex) {
            log.warn("Failed to record audit log for settings update: {}", ex.getMessage());
        }

        log.info("Updated {} system settings in PostgreSQL", settings.size());
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
