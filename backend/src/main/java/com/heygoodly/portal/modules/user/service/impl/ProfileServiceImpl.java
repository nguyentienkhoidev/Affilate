package com.heygoodly.portal.modules.user.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.constant.EntityFieldConstants;
import com.heygoodly.portal.common.exception.BadRequestException;
import com.heygoodly.portal.common.exception.ResourceNotFoundException;
import com.heygoodly.portal.common.util.NullSafeUtils;
import com.heygoodly.portal.modules.audit.dto.request.CreateAuditLogRequest;
import com.heygoodly.portal.modules.audit.entity.AuditLogEntity;
import com.heygoodly.portal.modules.audit.repository.AuditLogRepository;
import com.heygoodly.portal.modules.audit.service.AuditLogService;
import com.heygoodly.portal.modules.role.entity.PermissionEntity;
import com.heygoodly.portal.modules.role.entity.RoleEntity;
import com.heygoodly.portal.modules.setting.service.SettingService;
import com.heygoodly.portal.modules.user.dto.request.ChangePasswordRequest;
import com.heygoodly.portal.modules.user.dto.request.UpdateProfileRequest;
import com.heygoodly.portal.modules.user.dto.response.ProfileResponse;
import com.heygoodly.portal.modules.user.dto.response.SessionResponse;
import com.heygoodly.portal.modules.user.dto.response.TwoFactorDetailsResponse;
import com.heygoodly.portal.modules.user.entity.UserEntity;
import com.heygoodly.portal.modules.user.entity.UserLoginRecordEntity;
import com.heygoodly.portal.modules.user.repository.UserLoginRecordRepository;
import com.heygoodly.portal.modules.user.repository.UserRepository;
import com.heygoodly.portal.modules.user.service.ProfileService;
import com.heygoodly.portal.security.TotpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final UserLoginRecordRepository loginRecordRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuditLogService auditLogService;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;
    private final TotpService totpService;
    private final SettingService settingService;

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Long userId) {
        UserEntity user = getUserOrThrow(userId);
        return mapToProfileResponse(user);
    }

    @Override
    @Transactional
    public ProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        UserEntity user = getUserOrThrow(userId);

        user.setFullName(NullSafeUtils.safeTrim(request.getFullName()));
        user.setPhone(NullSafeUtils.safeTrim(request.getPhone()));
        user.setAvatar(NullSafeUtils.safeTrim(request.getAvatar()));
        user.setDepartment(NullSafeUtils.safeTrim(request.getDepartment()));
        user.setTimezone(NullSafeUtils.safeTrim(request.getTimezone()));
        user.setBio(NullSafeUtils.safeTrim(request.getBio()));
        user.setSocialX(NullSafeUtils.safeTrim(request.getSocialX()));
        user.setSocialLinkedIn(NullSafeUtils.safeTrim(request.getSocialLinkedIn()));

        UserEntity saved = userRepository.save(user);

        // Record audit activity
        try {
            auditLogService.recordLog(CreateAuditLogRequest.builder()
                    .userEmail(saved.getEmail())
                    .action("UPDATE_PROFILE")
                    .module("users")
                    .resourceId(String.valueOf(saved.getId()))
                    .resourceName(saved.getFullName())
                    .status("SUCCESS")
                    .build());
        } catch (Exception ex) {
            log.warn("Failed to record profile update audit log: {}", ex.getMessage());
        }

        return mapToProfileResponse(saved);
    }

    @Override
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        UserEntity user = getUserOrThrow(userId);

        String currentRaw = request.getCurrentPassword();
        String nextRaw = request.getNewPassword();
        String confirmRaw = request.getConfirmPassword();

        if (!passwordEncoder.matches(currentRaw, user.getPasswordHash())) {
            throw new BadRequestException("Current password does not match our records.");
        }

        if (passwordEncoder.matches(nextRaw, user.getPasswordHash())) {
            throw new BadRequestException("New password cannot be identical to your current password.");
        }

        if (!nextRaw.equals(confirmRaw)) {
            throw new BadRequestException("New password and confirmation do not match.");
        }

        user.setPasswordHash(passwordEncoder.encode(nextRaw));
        user.setPasswordUpdatedAt(Instant.now());
        userRepository.save(user);

        // Invalidate other sessions if requested
        if (request.isInvalidateOtherSessions()) {
            loginRecordRepository.deleteByUserIdAndIdNot(userId, -1L);
        }

        // Record audit activity
        try {
            auditLogService.recordLog(CreateAuditLogRequest.builder()
                    .userEmail(user.getEmail())
                    .action("CHANGE_PASSWORD")
                    .module("auth")
                    .resourceId(String.valueOf(user.getId()))
                    .resourceName("User Password Changed")
                    .status("SUCCESS")
                    .build());
        } catch (Exception ex) {
            log.warn("Failed to record password change audit log: {}", ex.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean verifyPassword(Long userId, String password) {
        UserEntity user = getUserOrThrow(userId);
        if (password == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new BadRequestException("Current password does not match our records.");
        }
        return true;
    }

    @Override
    @Transactional
    public TwoFactorDetailsResponse unlockTwoFactor(Long userId, String password) {
        UserEntity user = getUserOrThrow(userId);
        if (password == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new BadRequestException("Current password does not match our records.");
        }

        boolean enabled = Boolean.TRUE.equals(user.getTwoFactorEnabled());
        List<String> recoveryCodes = new ArrayList<>();
        if (user.getTwoFactorRecoveryCodes() != null && !user.getTwoFactorRecoveryCodes().isBlank()) {
            try {
                recoveryCodes = objectMapper.readValue(user.getTwoFactorRecoveryCodes(), new TypeReference<List<String>>() {});
            } catch (Exception ex) {
                log.warn("Failed to parse recovery codes for user {}: {}", user.getEmail(), ex.getMessage());
            }
        }

        if (enabled && recoveryCodes.isEmpty()) {
            recoveryCodes = totpService.generateRecoveryCodes(8);
            try {
                user.setTwoFactorRecoveryCodes(objectMapper.writeValueAsString(recoveryCodes));
                userRepository.save(user);
            } catch (Exception ex) {
                log.warn("Failed to serialize recovery codes: {}", ex.getMessage());
            }
        }

        String qrCodeUri = null;
        if (user.getTwoFactorSecret() != null && !user.getTwoFactorSecret().isBlank()) {
            String issuer = settingService.getSettingValue("two_factor_issuer", "HeyGoodlyProCMS");
            qrCodeUri = String.format("otpauth://totp/%s:%s?secret=%s&issuer=%s",
                    issuer, user.getEmail(), user.getTwoFactorSecret(), issuer);
        }

        return TwoFactorDetailsResponse.builder()
                .twoFactorEnabled(enabled)
                .secretKey(user.getTwoFactorSecret())
                .qrCodeUri(qrCodeUri)
                .recoveryCodes(recoveryCodes)
                .build();
    }

    @Override
    @Transactional
    public List<String> regenerateRecoveryCodes(Long userId) {
        UserEntity user = getUserOrThrow(userId);
        if (!Boolean.TRUE.equals(user.getTwoFactorEnabled())) {
            throw new BadRequestException("Two-factor authentication is not enabled for this account.");
        }
        List<String> codes = totpService.generateRecoveryCodes(8);
        try {
            user.setTwoFactorRecoveryCodes(objectMapper.writeValueAsString(codes));
            userRepository.save(user);
        } catch (Exception ex) {
            throw new BadRequestException("Could not persist regenerated recovery codes.");
        }
        try {
            auditLogService.recordLog(CreateAuditLogRequest.builder()
                    .userEmail(user.getEmail())
                    .action("REGENERATE_RECOVERY_CODES")
                    .module("security")
                    .resourceId(String.valueOf(user.getId()))
                    .resourceName("Emergency Backup Recovery Codes (8)")
                    .status("SUCCESS")
                    .build());
        } catch (Exception ex) {
            log.warn("Failed to record audit log: {}", ex.getMessage());
        }
        return codes;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionResponse> getSessions(Long userId, String currentIp) {
        List<UserLoginRecordEntity> records = loginRecordRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (records.isEmpty()) {
            return Collections.emptyList();
        }

        // Deduplicate by (device + "::" + ipAddress) to show only unique active device sessions
        Set<String> seenDeviceIp = new HashSet<>();
        List<SessionResponse> result = new ArrayList<>();
        boolean isFirst = true;

        for (UserLoginRecordEntity r : records) {
            String devKey = (r.getDevice() != null ? r.getDevice().trim().toLowerCase() : "") + "::"
                    + (r.getIpAddress() != null ? r.getIpAddress().trim() : "");
            if (seenDeviceIp.contains(devKey)) {
                continue;
            }
            seenDeviceIp.add(devKey);

            boolean isCurrent = isFirst;
            isFirst = false;

            String browser = "Browser";
            String deviceName = r.getDevice() != null ? r.getDevice() : "Desktop Device";
            if (deviceName.contains("/")) {
                String[] parts = deviceName.split("/");
                deviceName = parts[0].trim();
                browser = parts[1].trim();
            }

            String duration = isCurrent
                    ? "Active now"
                    : (r.getDuration() != null && !r.getDuration().equalsIgnoreCase("Active now")
                    ? r.getDuration()
                    : "Remote Session");

            result.add(new SessionResponse(
                    r.getId(),
                    deviceName,
                    browser,
                    r.getIpAddress(),
                    r.getLocation() != null ? r.getLocation() : "Unknown Location",
                    r.getAuthMethod() != null ? r.getAuthMethod() : "Password",
                    duration,
                    isCurrent,
                    r.getCreatedAt()
            ));
        }
        return result;
    }

    @Override
    @Transactional
    public void revokeSession(Long userId, Long sessionId) {
        loginRecordRepository.deleteByUserIdAndId(userId, sessionId);
    }

    @Override
    @Transactional
    public void revokeOtherSessions(Long userId, String currentIp) {
        List<UserLoginRecordEntity> records = loginRecordRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (!records.isEmpty()) {
            Long currentRecordId = records.get(0).getId();
            loginRecordRepository.deleteByUserIdAndIdNot(userId, currentRecordId);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogEntity> getUserAuditLogs(Long userId, String userEmail, String type, String search) {
        String safeType = NullSafeUtils.safeTrim(type);
        String safeSearch = NullSafeUtils.safeTrim(search);
        return auditLogRepository.findByUserActivityFiltered(
                userEmail,
                userId,
                safeType.isEmpty() ? null : safeType,
                safeSearch.isEmpty() ? null : safeSearch,
                PageRequest.of(AppConstants.DEFAULT_PAGE_NUMBER, AppConstants.MAX_PAGE_SIZE)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Boolean> getNotificationPreferences(Long userId) {
        UserEntity user = getUserOrThrow(userId);
        return parseNotificationPreferences(user.getNotificationPreferences());
    }

    @Override
    @Transactional
    public Map<String, Boolean> updateNotificationPreferences(Long userId, Map<String, Boolean> preferences) {
        UserEntity user = getUserOrThrow(userId);
        try {
            String json = objectMapper.writeValueAsString(preferences);
            user.setNotificationPreferences(json);
            userRepository.save(user);
        } catch (Exception ex) {
            log.error("Failed to serialize notification preferences: {}", ex.getMessage());
        }
        return preferences;
    }

    private UserEntity getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("User not found with %s: %d", EntityFieldConstants.ID, userId)));
    }

    private ProfileResponse mapToProfileResponse(UserEntity user) {
        RoleEntity role = user.getRole();
        String roleName = role != null ? role.getName() : "Staff Member";
        String roleSlug = role != null ? role.getSlug() : "staff";

        List<String> permissions = new ArrayList<>();
        if (Boolean.TRUE.equals(user.getIsSuperAdmin())) {
            permissions.add("*");
        } else if (role != null && role.getPermissions() != null) {
            permissions = role.getPermissions().stream()
                    .map(PermissionEntity::getCode)
                    .collect(Collectors.toList());
        }

        Map<String, Boolean> notifPrefs = parseNotificationPreferences(user.getNotificationPreferences());

        return new ProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone() != null ? user.getPhone() : "",
                user.getAvatar() != null ? user.getAvatar() : "",
                user.getDepartment() != null ? user.getDepartment() : "General Management",
                user.getTimezone() != null ? user.getTimezone() : "UTC+07:00 (Bangkok, Hanoi, Jakarta)",
                user.getBio() != null ? user.getBio() : "",
                user.getSocialX() != null ? user.getSocialX() : "",
                user.getSocialLinkedIn() != null ? user.getSocialLinkedIn() : "",
                roleName,
                roleSlug,
                Boolean.TRUE.equals(user.getIsSuperAdmin()),
                Boolean.TRUE.equals(user.getTwoFactorEnabled()),
                user.getLastLoginAt(),
                user.getLastLoginIp(),
                user.getPasswordUpdatedAt(),
                permissions,
                notifPrefs
        );
    }

    private Map<String, Boolean> parseNotificationPreferences(String json) {
        if (json != null && !json.trim().isEmpty()) {
            try {
                return objectMapper.readValue(json, new TypeReference<Map<String, Boolean>>() {});
            } catch (Exception ignored) {}
        }
        Map<String, Boolean> defaults = new HashMap<>();
        defaults.put("securityLogins", true);
        defaults.put("twoFaChanges", true);
        defaults.put("commissionSpikes", true);
        defaults.put("couponExpirations", true);
        defaults.put("customerFeedback", true);
        defaults.put("browserPush", false);
        return defaults;
    }
}

