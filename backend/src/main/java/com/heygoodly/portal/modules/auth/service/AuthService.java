package com.heygoodly.portal.modules.auth.service;

import com.heygoodly.portal.modules.auth.dto.LoginRequest;
import com.heygoodly.portal.modules.auth.dto.LoginResponse;
import com.heygoodly.portal.modules.auth.dto.RefreshTokenRequest;
import com.heygoodly.portal.modules.auth.dto.TwoFactorSetupResponse;
import com.heygoodly.portal.modules.auth.dto.Verify2FaRequest;
import com.heygoodly.portal.modules.auth.dto.Verify2FaSetupRequest;
import com.heygoodly.portal.modules.user.dto.response.UserSummaryResponse;

import java.util.List;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    LoginResponse verify2Fa(Verify2FaRequest request);
    LoginResponse refreshToken(RefreshTokenRequest request);
    TwoFactorSetupResponse initiate2Fa(Long userId);
    List<String> confirm2Fa(Long userId, Verify2FaSetupRequest request, String secretKey);
    void disable2Fa(Long userId);
    UserSummaryResponse getCurrentUserProfile(Long userId);
    void logout(String accessToken, String refreshToken);
}
