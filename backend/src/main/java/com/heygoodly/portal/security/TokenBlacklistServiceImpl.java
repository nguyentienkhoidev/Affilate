package com.heygoodly.portal.security;

import com.heygoodly.portal.common.constant.SecurityConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.HexFormat;

@Slf4j
@Service
@RequiredArgsConstructor
public class TokenBlacklistServiceImpl implements TokenBlacklistService {

    private final StringRedisTemplate stringRedisTemplate;

    @Override
    public void blacklistToken(String token, long expirationTimeMs) {
        if (token == null || token.isBlank()) return;
        long ttlMs = expirationTimeMs - System.currentTimeMillis();
        if (ttlMs > 0) {
            String key = SecurityConstants.REDIS_BLACKLIST_TOKEN_PREFIX + hashToken(token);
            stringRedisTemplate.opsForValue().set(key, "revoked", Duration.ofMillis(ttlMs));
            log.info("Access token blacklisted in Redis with TTL {} ms", ttlMs);
        }
    }

    @Override
    public void blacklistRefreshToken(String refreshToken, long expirationTimeMs) {
        if (refreshToken == null || refreshToken.isBlank()) return;
        long ttlMs = expirationTimeMs - System.currentTimeMillis();
        if (ttlMs > 0) {
            String key = SecurityConstants.REDIS_BLACKLIST_REFRESH_PREFIX + hashToken(refreshToken);
            stringRedisTemplate.opsForValue().set(key, "revoked", Duration.ofMillis(ttlMs));
            log.info("Refresh token blacklisted in Redis with TTL {} ms", ttlMs);
        }
    }

    @Override
    public boolean isTokenBlacklisted(String token) {
        if (token == null || token.isBlank()) return false;
        try {
            String key = SecurityConstants.REDIS_BLACKLIST_TOKEN_PREFIX + hashToken(token);
            return Boolean.TRUE.equals(stringRedisTemplate.hasKey(key));
        } catch (Exception ex) {
            log.error("Redis connection error while checking token blacklist: {}", ex.getMessage());
            return false;
        }
    }

    @Override
    public boolean isRefreshTokenBlacklisted(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) return false;
        try {
            String key = SecurityConstants.REDIS_BLACKLIST_REFRESH_PREFIX + hashToken(refreshToken);
            return Boolean.TRUE.equals(stringRedisTemplate.hasKey(key));
        } catch (Exception ex) {
            log.error("Redis connection error while checking refresh token blacklist: {}", ex.getMessage());
            return false;
        }
    }

    @Override
    public void invalidateAllUserTokens(Long userId) {
        if (userId == null) return;
        try {
            String key = SecurityConstants.REDIS_USER_INVALID_BEFORE_PREFIX + userId;
            // Retain for 7 days (maximum refresh token lifespan)
            stringRedisTemplate.opsForValue().set(key, String.valueOf(System.currentTimeMillis()), Duration.ofDays(7));
            log.info("Invalidated all active tokens before now for userId [{}]", userId);
        } catch (Exception ex) {
            log.error("Redis error invalidating user tokens: {}", ex.getMessage());
        }
    }

    @Override
    public boolean isUserTokenRevoked(Long userId, long tokenIssuedAtMs) {
        if (userId == null) return false;
        try {
            String key = SecurityConstants.REDIS_USER_INVALID_BEFORE_PREFIX + userId;
            String invalidBeforeStr = stringRedisTemplate.opsForValue().get(key);
            if (invalidBeforeStr != null) {
                long invalidBeforeMs = Long.parseLong(invalidBeforeStr);
                return tokenIssuedAtMs < invalidBeforeMs;
            }
        } catch (Exception ex) {
            log.error("Redis error checking user token revocation: {}", ex.getMessage());
        }
        return false;
    }

    private String hashToken(String token) {
        if (token == null) return "";
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            return String.valueOf(token.hashCode());
        }
    }
}

