package com.bargorya.portal.modules.auth.dto;

import java.util.List;

public record TwoFactorSetupResponse(
        String secretKey,
        String qrCodeUri,
        List<String> recoveryCodes
) {}
