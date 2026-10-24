package com.bargorya.portal.modules.auth.service;

import com.bargorya.portal.common.constant.ErrorCodes;
import com.bargorya.portal.common.exception.BadRequestException;
import com.bargorya.portal.common.exception.ResourceNotFoundException;
import com.bargorya.portal.common.exception.UnauthorizedException;
import com.bargorya.portal.modules.auth.dto.LoginRequest;
import com.bargorya.portal.modules.auth.dto.LoginResponse;
import com.bargorya.portal.modules.auth.dto.RefreshTokenRequest;
import com.bargorya.portal.modules.auth.dto.TwoFactorSetupResponse;
import com.bargorya.portal.modules.auth.dto.Verify2FaRequest;
import com.bargorya.portal.modules.auth.dto.Verify2FaSetupRequest;
import com.bargorya.portal.modules.role.entity.PermissionEntity;
import com.bargorya.portal.modules.user.dto.response.UserSummaryResponse;
import com.bargorya.portal.modules.user.entity.UserEntity;
import com.bargorya.portal.modules.user.repository.UserRepository;
import com.bargorya.portal.security.JwtProvider;
import com.bargorya.portal.security.TotpService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final TotpService totpService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public LoginResponse login(LoginRequest request) {
        UserEntity user = userRepository.findByEmailAndIsDeletedFalse(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new UnauthorizedException("Your account has been deactivated. Please contact administrator.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password.");
        }

        // Check if 2FA is enabled
        if (Boolean.TRUE.equals(user.getTwoFactorEnabled())) {
            if (request.getOtpCode() == null) {
                // Return a temporary token for step 2 verification
                String tempToken = jwtProvider.generateAccessToken(
                        user.getId(),
                        user.getEmail(),
                        List.of("ROLE_PRE_AUTH"),
                        false
                );
                return LoginResponse.requires2Fa(tempToken);
            }

            // Verify OTP code if provided directly
            boolean valid = totpService.verifyCode(user.getTwoFactorSecret(), request.getOtpCode());
            if (!valid) {
                throw new BadRequestException("Invalid two-factor authentication code.", ErrorCodes.INVALID_OTP_CODE);
            }
        }

        return generateLoginSuccessResponse(user);
    }

    @Override
    @Transactional
    public LoginResponse verify2Fa(Verify2FaRequest request) {
        if (!jwtProvider.validateToken(request.getTempToken())) {
            throw new UnauthorizedException("Invalid or expired verification session.");
        }

        String email = jwtProvider.getEmailFromToken(request.getTempToken());
        UserEntity user = userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new UnauthorizedException("User not found."));

        boolean verified = false;

        // Try standard OTP code
        if (request.getOtpCode() != null) {
            verified = totpService.verifyCode(user.getTwoFactorSecret(), request.getOtpCode());
        }

        // Try backup recovery code if OTP failed or not provided
        if (!verified && request.getRecoveryCode() != null && !request.getRecoveryCode().isBlank()) {
            verified = checkAndConsumeRecoveryCode(user, request.getRecoveryCode().trim().toUpperCase());
        }

        if (!verified) {
            throw new BadRequestException("Invalid authentication code or recovery code.", ErrorCodes.INVALID_OTP_CODE);
        }

        return generateLoginSuccessResponse(user);
    }

    @Override
    public LoginResponse refreshToken(RefreshTokenRequest request) {
        if (!jwtProvider.validateToken(request.getRefreshToken())) {
            throw new UnauthorizedException("Invalid or expired refresh token.");
        }

        String email = jwtProvider.getEmailFromToken(request.getRefreshToken());
        UserEntity user = userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new UnauthorizedException("User not found."));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new UnauthorizedException("Account is deactivated.");
        }

        return generateLoginSuccessResponse(user);
    }

    @Override
    public TwoFactorSetupResponse initiate2Fa(Long userId) {
        UserEntity user = getUserOrThrow(userId);
        GoogleAuthenticatorKey key = totpService.generateSecretKey();
        String qrCodeUri = totpService.getQrCodeUri(key, user.getEmail());
        List<String> recoveryCodes = totpService.generateRecoveryCodes(8);

        return new TwoFactorSetupResponse(key.getKey(), qrCodeUri, recoveryCodes);
    }

    @Override
    @Transactional
    public void confirm2Fa(Long userId, Verify2FaSetupRequest request, String secretKey) {
        UserEntity user = getUserOrThrow(userId);

        boolean valid = totpService.verifyCode(secretKey, request.getOtpCode());
        if (!valid) {
            throw new BadRequestException("Invalid OTP verification code. Please try again.", ErrorCodes.INVALID_OTP_CODE);
        }

        List<String> recoveryCodes = totpService.generateRecoveryCodes(8);
        try {
            user.setTwoFactorSecret(secretKey);
            user.setTwoFactorEnabled(true);
            user.setTwoFactorRecoveryCodes(objectMapper.writeValueAsString(recoveryCodes));
            userRepository.save(user);
            log.info("2FA successfully enabled for user: {}", user.getEmail());
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize recovery codes: ", e);
            throw new BadRequestException("Could not save recovery codes.", ErrorCodes.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    @Transactional
    public void disable2Fa(Long userId) {
        UserEntity user = getUserOrThrow(userId);
        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        user.setTwoFactorRecoveryCodes(null);
        userRepository.save(user);
        log.info("2FA disabled for user: {}", user.getEmail());
    }

    @Override
    public UserSummaryResponse getCurrentUserProfile(Long userId) {
        UserEntity user = getUserOrThrow(userId);
        return mapToUserSummary(user);
    }

    private UserEntity getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .filter(u -> !Boolean.TRUE.equals(u.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    private LoginResponse generateLoginSuccessResponse(UserEntity user) {
        List<String> permissions = new ArrayList<>();
        if (user.getRole() != null && user.getRole().getPermissions() != null) {
            permissions = user.getRole().getPermissions().stream()
                    .map(PermissionEntity::getCode)
                    .toList();
        }

        String accessToken = jwtProvider.generateAccessToken(
                user.getId(),
                user.getEmail(),
                permissions,
                Boolean.TRUE.equals(user.getIsSuperAdmin())
        );

        String refreshToken = jwtProvider.generateRefreshToken(user.getEmail());
        UserSummaryResponse userSummary = mapToUserSummary(user);

        return LoginResponse.success(accessToken, refreshToken, userSummary);
    }

    private UserSummaryResponse mapToUserSummary(UserEntity user) {
        List<String> permissions = new ArrayList<>();
        String roleName = user.getRole() != null ? user.getRole().getName() : "";
        String roleSlug = user.getRole() != null ? user.getRole().getSlug() : "";

        if (user.getRole() != null && user.getRole().getPermissions() != null) {
            permissions = user.getRole().getPermissions().stream()
                    .map(PermissionEntity::getCode)
                    .toList();
        }

        return new UserSummaryResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                roleName,
                roleSlug,
                user.getAvatar(),
                Boolean.TRUE.equals(user.getIsSuperAdmin()),
                Boolean.TRUE.equals(user.getTwoFactorEnabled()),
                permissions
        );
    }

    private boolean checkAndConsumeRecoveryCode(UserEntity user, String code) {
        if (user.getTwoFactorRecoveryCodes() == null) return false;
        try {
            List<String> codes = objectMapper.readValue(
                    user.getTwoFactorRecoveryCodes(),
                    new TypeReference<List<String>>() {}
            );
            if (codes.remove(code)) {
                user.setTwoFactorRecoveryCodes(objectMapper.writeValueAsString(codes));
                userRepository.save(user);
                log.info("Used recovery code for user: {}", user.getEmail());
                return true;
            }
        } catch (Exception e) {
            log.error("Failed to parse recovery codes for user {}: ", user.getEmail(), e);
        }
        return false;
    }
}
