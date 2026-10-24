package com.bargorya.portal.modules.auth.controller;

import com.bargorya.portal.common.constant.MessageConstants;
import com.bargorya.portal.common.dto.ApiResponse;
import com.bargorya.portal.common.exception.UnauthorizedException;
import com.bargorya.portal.common.util.SecurityUtils;
import com.bargorya.portal.modules.auth.dto.LoginRequest;
import com.bargorya.portal.modules.auth.dto.LoginResponse;
import com.bargorya.portal.modules.auth.dto.RefreshTokenRequest;
import com.bargorya.portal.modules.auth.dto.TwoFactorSetupResponse;
import com.bargorya.portal.modules.auth.dto.Verify2FaRequest;
import com.bargorya.portal.modules.auth.dto.Verify2FaSetupRequest;
import com.bargorya.portal.modules.auth.service.AuthService;
import com.bargorya.portal.modules.user.dto.response.UserSummaryResponse;
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

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> getProfile() {
        Long userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("User is not authenticated."));
        UserSummaryResponse profile = authService.getCurrentUserProfile(userId);
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @PostMapping("/2fa/initiate")
    @PreAuthorize("hasAuthority('user.2fa_self') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TwoFactorSetupResponse>> initiate2Fa() {
        Long userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("User is not authenticated."));
        TwoFactorSetupResponse setup = authService.initiate2Fa(userId);
        return ResponseEntity.ok(ApiResponse.ok(setup));
    }

    @PostMapping("/2fa/confirm")
    @PreAuthorize("hasAuthority('user.2fa_self') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> confirm2Fa(
            @Valid @RequestBody Verify2FaSetupRequest request,
            @RequestParam("secretKey") String secretKey
    ) {
        Long userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("User is not authenticated."));
        authService.confirm2Fa(userId, request, secretKey);
        return ResponseEntity.ok(ApiResponse.ok(MessageConstants.TWO_FACTOR_ENABLED, null));
    }

    @PostMapping("/2fa/disable")
    @PreAuthorize("hasAuthority('user.2fa_self') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> disable2Fa() {
        Long userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("User is not authenticated."));
        authService.disable2Fa(userId);
        return ResponseEntity.ok(ApiResponse.ok(MessageConstants.TWO_FACTOR_DISABLED, null));
    }
}
