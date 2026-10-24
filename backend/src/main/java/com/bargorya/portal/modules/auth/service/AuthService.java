package com.bargorya.portal.modules.auth.service;

import com.bargorya.portal.modules.auth.dto.LoginRequest;
import com.bargorya.portal.modules.auth.dto.LoginResponse;
import com.bargorya.portal.modules.auth.dto.RefreshTokenRequest;
import com.bargorya.portal.modules.auth.dto.TwoFactorSetupResponse;
import com.bargorya.portal.modules.auth.dto.Verify2FaRequest;
import com.bargorya.portal.modules.auth.dto.Verify2FaSetupRequest;
import com.bargorya.portal.modules.user.dto.response.UserSummaryResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    LoginResponse verify2Fa(Verify2FaRequest request);
    LoginResponse refreshToken(RefreshTokenRequest request);
    TwoFactorSetupResponse initiate2Fa(Long userId);
    void confirm2Fa(Long userId, Verify2FaSetupRequest request, String secretKey);
    void disable2Fa(Long userId);
    UserSummaryResponse getCurrentUserProfile(Long userId);
}
