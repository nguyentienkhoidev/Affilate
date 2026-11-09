package com.heygoodly.portal.common.constant;

public final class HttpHeaderConstants {

    private HttpHeaderConstants() {}

    public static final String X_ROBOTS_TAG = "X-Robots-Tag";
    public static final String ROBOTS_NOINDEX_NOFOLLOW = "noindex, nofollow, noarchive";
    public static final String CACHE_CONTROL_NO_STORE = "no-cache, no-store, must-revalidate";
    public static final String PRAGMA_NO_CACHE = "no-cache";
    public static final String EXPIRES_ZERO = "0";

    // Client IP & Proxy Headers
    public static final String HEADER_CF_CONNECTING_IP = "CF-Connecting-IP";
    public static final String HEADER_X_FORWARDED_FOR = "X-Forwarded-For";
    public static final String HEADER_X_REAL_IP = "X-Real-IP";
    public static final String HEADER_USER_AGENT = "User-Agent";
    public static final String HEADER_REFERER = "Referer";
}

