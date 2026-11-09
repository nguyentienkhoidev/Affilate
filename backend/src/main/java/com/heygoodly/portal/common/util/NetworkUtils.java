package com.heygoodly.portal.common.util;

import com.heygoodly.portal.common.constant.HttpHeaderConstants;
import jakarta.servlet.http.HttpServletRequest;

public final class NetworkUtils {

    private static final String UNKNOWN = "unknown";

    private NetworkUtils() {}

    /**
     * Resolves the real client IP address behind reverse proxies (Cloudflare, Nginx, AWS ALB).
     *
     * @param request current HttpServletRequest
     * @return client IP address as a string
     */
    public static String getClientIp(HttpServletRequest request) {
        if (request == null) {
            return UNKNOWN;
        }

        // 1. Cloudflare header
        String ip = request.getHeader(HttpHeaderConstants.HEADER_CF_CONNECTING_IP);
        if (isValidIp(ip)) {
            return ip.trim();
        }

        // 2. Standard X-Forwarded-For header (can contain multiple IPs separated by comma)
        ip = request.getHeader(HttpHeaderConstants.HEADER_X_FORWARDED_FOR);
        if (isValidIp(ip)) {
            // First IP in the comma-separated list is the original client
            int commaIdx = ip.indexOf(',');
            return commaIdx > 0 ? ip.substring(0, commaIdx).trim() : ip.trim();
        }

        // 3. Nginx X-Real-IP
        ip = request.getHeader(HttpHeaderConstants.HEADER_X_REAL_IP);
        if (isValidIp(ip)) {
            return ip.trim();
        }

        // 4. Fallback to direct socket address
        String remoteAddr = request.getRemoteAddr();
        return (remoteAddr != null && !remoteAddr.isBlank()) ? remoteAddr : UNKNOWN;
    }

    private static boolean isValidIp(String ip) {
        return ip != null && !ip.isBlank() && !UNKNOWN.equalsIgnoreCase(ip.trim());
    }
}

