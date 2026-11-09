package com.heygoodly.portal.modules.user.service;

import com.heygoodly.portal.modules.audit.entity.AuditLogEntity;
import com.heygoodly.portal.modules.user.dto.request.ChangePasswordRequest;
import com.heygoodly.portal.modules.user.dto.request.UpdateProfileRequest;
import com.heygoodly.portal.modules.user.dto.response.ProfileResponse;
import com.heygoodly.portal.modules.user.dto.response.SessionResponse;
import com.heygoodly.portal.modules.user.dto.response.TwoFactorDetailsResponse;

import java.util.List;
import java.util.Map;

public interface ProfileService {

    ProfileResponse getProfile(Long userId);

    ProfileResponse updateProfile(Long userId, UpdateProfileRequest request);

    void changePassword(Long userId, ChangePasswordRequest request);

    boolean verifyPassword(Long userId, String password);

    TwoFactorDetailsResponse unlockTwoFactor(Long userId, String password);

    List<String> regenerateRecoveryCodes(Long userId);

    List<SessionResponse> getSessions(Long userId, String currentIp);

    void revokeSession(Long userId, Long sessionId);

    void revokeOtherSessions(Long userId, String currentIp);

    List<AuditLogEntity> getUserAuditLogs(Long userId, String userEmail, String type, String search);

    Map<String, Boolean> getNotificationPreferences(Long userId);

    Map<String, Boolean> updateNotificationPreferences(Long userId, Map<String, Boolean> preferences);
}

