package com.heygoodly.portal.security;

import com.heygoodly.portal.modules.setting.service.SettingService;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorConfig;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.GoogleAuthenticatorQRGenerator;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;

@Service
public class TotpService {

    private final SettingService settingService;
    private final SecureRandom secureRandom = new SecureRandom();

    public TotpService(SettingService settingService) {
        this.settingService = settingService;
    }

    public GoogleAuthenticatorKey generateSecretKey() {
        GoogleAuthenticator gAuth = getGoogleAuthenticatorInstance();
        return gAuth.createCredentials();
    }

    public String getQrCodeUri(GoogleAuthenticatorKey credentials, String accountName) {
        String issuer = settingService.getSettingValue("two_factor_issuer", "HeyGoodlyProCMS");
        return GoogleAuthenticatorQRGenerator.getOtpAuthTotpURL(issuer, accountName, credentials);
    }

    public boolean verifyCode(String secretKey, int verificationCode) {
        if (secretKey == null || secretKey.isBlank()) {
            return false;
        }
        GoogleAuthenticator gAuth = getGoogleAuthenticatorInstance();
        return gAuth.authorize(secretKey, verificationCode);
    }

    public List<String> generateRecoveryCodes(int count) {
        List<String> codes = new ArrayList<>(count);
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        for (int i = 0; i < count; i++) {
            StringBuilder sb = new StringBuilder();
            for (int j = 0; j < 10; j++) {
                if (j == 5) {
                    sb.append("-");
                }
                sb.append(chars.charAt(secureRandom.nextInt(chars.length())));
            }
            codes.add(sb.toString());
        }
        return codes;
    }

    private GoogleAuthenticator getGoogleAuthenticatorInstance() {
        int windowSize = 3;
        try {
            String val = settingService.getSettingValue("two_factor_window_size", "3");
            windowSize = Integer.parseInt(val);
        } catch (Exception ignored) {}

        GoogleAuthenticatorConfig config = new GoogleAuthenticatorConfig.GoogleAuthenticatorConfigBuilder()
                .setWindowSize(windowSize)
                .build();
        return new GoogleAuthenticator(config);
    }
}
