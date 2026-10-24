package com.bargorya.portal.security;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.GoogleAuthenticatorQRGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;

@Service
public class TotpService {

    private final GoogleAuthenticator gAuth = new GoogleAuthenticator();
    private final String issuer;
    private final SecureRandom secureRandom = new SecureRandom();

    public TotpService(@Value("${app.two-factor.issuer:BargoryaProCMS}") String issuer) {
        this.issuer = issuer;
    }

    public GoogleAuthenticatorKey generateSecretKey() {
        return gAuth.createCredentials();
    }

    public String getQrCodeUri(GoogleAuthenticatorKey credentials, String accountName) {
        return GoogleAuthenticatorQRGenerator.getOtpAuthTotpURL(issuer, accountName, credentials);
    }

    public boolean verifyCode(String secretKey, int verificationCode) {
        if (secretKey == null || secretKey.isBlank()) {
            return false;
        }
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
}
