package com.heygoodly.portal.modules.user.controller;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.constant.MessageConstants;
import com.heygoodly.portal.common.dto.ApiResponse;
import com.heygoodly.portal.common.exception.AppException;
import com.heygoodly.portal.common.exception.ErrorCode;
import com.heygoodly.portal.common.util.SecurityUtils;
import com.heygoodly.portal.modules.audit.entity.AuditLogEntity;
import com.heygoodly.portal.modules.user.dto.request.ChangePasswordRequest;
import com.heygoodly.portal.modules.user.dto.request.UpdateProfileRequest;
import com.heygoodly.portal.modules.user.dto.request.VerifyPasswordRequest;
import com.heygoodly.portal.modules.user.dto.response.ProfileResponse;
import com.heygoodly.portal.modules.user.dto.response.SessionResponse;
import com.heygoodly.portal.modules.user.dto.response.TwoFactorDetailsResponse;
import com.heygoodly.portal.modules.user.service.ProfileService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/profile")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile() {
        Long userId = resolveUserId();
        ProfileResponse response = profileService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        Long userId = resolveUserId();
        ProfileResponse response = profileService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response, MessageConstants.UPDATED_SUCCESS));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Long userId = resolveUserId();
        profileService.changePassword(userId, request);
        return ResponseEntity.ok(ApiResponse.success(null, MessageConstants.UPDATED_SUCCESS));
    }

    @PostMapping("/verify-password")
    public ResponseEntity<ApiResponse<Boolean>> verifyPassword(@Valid @RequestBody VerifyPasswordRequest request) {
        Long userId = resolveUserId();
        boolean valid = profileService.verifyPassword(userId, request.getPassword());
        return ResponseEntity.ok(ApiResponse.ok(MessageConstants.SUCCESS, valid));
    }

    @PostMapping("/2fa/unlock")
    public ResponseEntity<ApiResponse<TwoFactorDetailsResponse>> unlockTwoFactor(@Valid @RequestBody VerifyPasswordRequest request) {
        Long userId = resolveUserId();
        TwoFactorDetailsResponse response = profileService.unlockTwoFactor(userId, request.getPassword());
        return ResponseEntity.ok(ApiResponse.ok(MessageConstants.SUCCESS, response));
    }

    @PostMapping("/2fa/regenerate-recovery-codes")
    public ResponseEntity<ApiResponse<List<String>>> regenerateRecoveryCodes() {
        Long userId = resolveUserId();
        List<String> codes = profileService.regenerateRecoveryCodes(userId);
        return ResponseEntity.ok(ApiResponse.ok(MessageConstants.SUCCESS, codes));
    }

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<SessionResponse>>> getSessions(HttpServletRequest request) {
        Long userId = resolveUserId();
        String clientIp = extractClientIp(request);
        List<SessionResponse> response = profileService.getSessions(userId, clientIp);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<ApiResponse<Void>> revokeSession(@PathVariable("id") Long sessionId) {
        Long userId = resolveUserId();
        profileService.revokeSession(userId, sessionId);
        return ResponseEntity.ok(ApiResponse.success(null, MessageConstants.DELETED_SUCCESS));
    }

    @DeleteMapping("/sessions/other")
    public ResponseEntity<ApiResponse<Void>> revokeOtherSessions(HttpServletRequest request) {
        Long userId = resolveUserId();
        String clientIp = extractClientIp(request);
        profileService.revokeOtherSessions(userId, clientIp);
        return ResponseEntity.ok(ApiResponse.success(null, MessageConstants.DELETED_SUCCESS));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLogEntity>>> getAuditLogs(
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "search", required = false) String search
    ) {
        Long userId = resolveUserId();
        String email = SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED));
        List<AuditLogEntity> logs = profileService.getUserAuditLogs(userId, email, type, search);
        return ResponseEntity.ok(ApiResponse.ok(logs));
    }

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> getNotifications() {
        Long userId = resolveUserId();
        Map<String, Boolean> prefs = profileService.getNotificationPreferences(userId);
        return ResponseEntity.ok(ApiResponse.ok(prefs));
    }

    @PutMapping("/notifications")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> updateNotifications(@RequestBody Map<String, Boolean> preferences) {
        Long userId = resolveUserId();
        Map<String, Boolean> prefs = profileService.updateNotificationPreferences(userId, preferences);
        return ResponseEntity.ok(ApiResponse.success(prefs, MessageConstants.UPDATED_SUCCESS));
    }

    private Long resolveUserId() {
        return SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED));
    }

    private String extractClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xf)) {
            return xf.split(AppConstants.COMMA)[0].trim();
        }
        return request.getRemoteAddr();
    }
}
