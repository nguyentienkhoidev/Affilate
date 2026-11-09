package com.heygoodly.portal.common.util;

public final class UserAgentUtils {

    private UserAgentUtils() {}

    /**
     * Parses the Platform / OS and browser in a clean, human-friendly format.
     * Examples: "macOS • Chrome", "Windows 11 • Edge", "Ubuntu Linux • Firefox", "iOS • Safari"
     */
    public static String parsePlatformOs(String userAgent) {
        if (userAgent == null || userAgent.isBlank() || "unknown".equalsIgnoreCase(userAgent.trim())) {
            return "Web Client";
        }
        String ua = userAgent.trim();

        // If it's already a clean formatted string from seed data (e.g. "Desktop Chrome / macOS")
        if (ua.contains(" / ") || (ua.contains(" • ") && !ua.contains("Mozilla/"))) {
            return ua;
        }

        String os = "Desktop";
        if (ua.contains("Macintosh") || ua.contains("Mac OS X")) {
            os = "macOS";
        } else if (ua.contains("Windows NT 10.0")) {
            os = "Windows 10/11";
        } else if (ua.contains("Windows NT 6.3")) {
            os = "Windows 8.1";
        } else if (ua.contains("Windows NT 6.1")) {
            os = "Windows 7";
        } else if (ua.contains("iPhone") || ua.contains("iPad") || ua.contains("iPod")) {
            os = "iOS";
        } else if (ua.contains("Android")) {
            os = "Android";
        } else if (ua.contains("Linux")) {
            os = "Linux";
        } else if (ua.contains("Postman")) {
            return "Postman API Client";
        } else if (ua.contains("curl")) {
            return "cURL Client";
        }

        String browser = "Browser";
        if (ua.contains("Edg/")) {
            browser = "Edge";
        } else if (ua.contains("Chrome/") && !ua.contains("Edg/")) {
            browser = "Chrome";
        } else if (ua.contains("Safari/") && !ua.contains("Chrome/")) {
            browser = "Safari";
        } else if (ua.contains("Firefox/")) {
            browser = "Firefox";
        }

        StringBuilder sb = new StringBuilder();
        sb.append(os).append(" • ").append(browser);
        return sb.toString();
    }

    /**
     * Extracts simple OS name (e.g. "macOS", "Windows", "Linux", "iOS", "Android").
     */
    public static String getSimpleOs(String userAgent) {
        if (userAgent == null) return "Unknown";
        String lower = userAgent.toLowerCase();
        if (lower.contains("mac")) return "macOS";
        if (lower.contains("win")) return "Windows";
        if (lower.contains("linux")) return "Linux";
        if (lower.contains("iphone") || lower.contains("ipad") || lower.contains("ios")) return "iOS";
        if (lower.contains("android")) return "Android";
        return "Desktop";
    }
}
