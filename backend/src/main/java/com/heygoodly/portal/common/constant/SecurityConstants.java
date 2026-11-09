package com.heygoodly.portal.common.constant;

public final class SecurityConstants {
    private SecurityConstants() {}

    public static final String TOKEN_HEADER = "Authorization";
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String ROLE_PREFIX = "ROLE_";
    public static final String SUPER_ADMIN_ROLE = "ROLE_SUPER_ADMIN";

    // JWT Claims
    public static final String CLAIM_USER_ID = "userId";
    public static final String CLAIM_AUTHORITIES = "authorities";
    public static final String CLAIM_PERMISSIONS = "permissions";
    public static final String CLAIM_IS_SUPER_ADMIN = "isSuperAdmin";
    public static final String CLAIM_EMAIL = "email";

    // Request Attributes for Auth Handling
    public static final String AUTH_ERROR_ATTRIBUTE = "X-Auth-Error";
    public static final String AUTH_ERROR_MESSAGE_ATTRIBUTE = "X-Auth-Error-Message";

    // Redis Blacklist & Session Keys
    public static final String REDIS_BLACKLIST_TOKEN_PREFIX = "heygoodly:auth:blacklist:token:";
    public static final String REDIS_BLACKLIST_REFRESH_PREFIX = "heygoodly:auth:blacklist:refresh:";
    public static final String REDIS_USER_INVALID_BEFORE_PREFIX = "heygoodly:auth:user:invalid_before:";
}
