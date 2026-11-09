package com.heygoodly.portal.modules.auth.controller;

import com.heygoodly.portal.common.constant.MessageConstants;
import com.heygoodly.portal.common.constant.PermissionConstants;
import com.heygoodly.portal.common.constant.SecurityConstants;
import com.heygoodly.portal.common.dto.ApiResponse;
import com.heygoodly.portal.common.exception.UnauthorizedException;
import com.heygoodly.portal.common.util.SecurityUtils;
import com.heygoodly.portal.modules.auth.dto.LoginRequest;
import com.heygoodly.portal.modules.auth.dto.LoginResponse;
import com.heygoodly.portal.modules.auth.dto.LogoutRequest;
import com.heygoodly.portal.modules.auth.dto.RefreshTokenRequest;
import com.heygoodly.portal.modules.auth.dto.TwoFactorSetupResponse;
import com.heygoodly.portal.modules.auth.dto.Verify2FaRequest;
import com.heygoodly.portal.modules.auth.dto.Verify2FaSetupRequest;
import com.heygoodly.portal.modules.auth.service.AuthService;
import com.heygoodly.portal.modules.role.enums.RoleCode;
import com.heygoodly.portal.modules.user.dto.response.UserSummaryResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(MessageConstants.LOGIN_SUCCESS, response));
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<ApiResponse<LoginResponse>> verify2Fa(@Valid @RequestBody Verify2FaRequest request) {
        LoginResponse response = authService.verify2Fa(request);
        return ResponseEntity.ok(ApiResponse.ok(MessageConstants.LOGIN_SUCCESS, response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        LoginResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            HttpServletRequest request,
            @RequestBody(required = false) LogoutRequest logoutRequest
    ) {
        String authHeader = request.getHeader(SecurityConstants.TOKEN_HEADER);
        String accessToken = null;
        if (authHeader != null && authHeader.startsWith(SecurityConstants.TOKEN_PREFIX)) {
            accessToken = authHeader.substring(SecurityConstants.TOKEN_PREFIX.length()).trim();
        }
        String refreshToken = logoutRequest != null ? logoutRequest.refreshToken() : null;
        authService.logout(accessToken, refreshToken);
        return ResponseEntity.ok(ApiResponse.ok("Session logged out successfully.", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> getProfile() {
        Long userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("User is not authenticated."));
        UserSummaryResponse profile = authService.getCurrentUserProfile(userId);
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @PostMapping("/2fa/initiate")
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_2FA_SELF + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<TwoFactorSetupResponse>> initiate2Fa() {
        Long userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("User is not authenticated."));
        TwoFactorSetupResponse setup = authService.initiate2Fa(userId);
        return ResponseEntity.ok(ApiResponse.ok(setup));
    }

    @PostMapping("/2fa/confirm")
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_2FA_SELF + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<List<String>>> confirm2Fa(
            @Valid @RequestBody Verify2FaSetupRequest request,
            @RequestParam(value = "secretKey", required = false) String secretKey
    ) {
        Long userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("User is not authenticated."));
        List<String> codes = authService.confirm2Fa(userId, request, secretKey);
        return ResponseEntity.ok(ApiResponse.ok(MessageConstants.TWO_FACTOR_ENABLED, codes));
    }

    @PostMapping("/2fa/disable")
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_2FA_SELF + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<Void>> disable2Fa() {
        Long userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("User is not authenticated."));
        authService.disable2Fa(userId);
        return ResponseEntity.ok(ApiResponse.ok(MessageConstants.TWO_FACTOR_DISABLED, null));
    }
}
