package com.bargorya.portal.modules.auth.dto;

import com.bargorya.portal.modules.user.dto.response.UserSummaryResponse;

public record LoginResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        boolean requiresTwoFactor,
        String tempToken,
        UserSummaryResponse user
) {
    public static LoginResponse success(String accessToken, String refreshToken, UserSummaryResponse user) {
        return new LoginResponse(accessToken, refreshToken, "Bearer", false, null, user);
    }

    public static LoginResponse requires2Fa(String tempToken) {
        return new LoginResponse(null, null, null, true, tempToken, null);
    }
}
