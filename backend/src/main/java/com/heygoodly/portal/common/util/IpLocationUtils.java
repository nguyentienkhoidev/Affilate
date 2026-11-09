package com.heygoodly.portal.common.util;

public final class IpLocationUtils {

    private IpLocationUtils() {}

    /**
     * Resolves geographical location from IP address.
     * Accurately identifies loopback/intranet ranges vs public ISP ranges.
     */
    public static String resolveLocation(String ipAddress) {
        if (ipAddress == null || ipAddress.isBlank() || "unknown".equalsIgnoreCase(ipAddress.trim())) {
            return "Internal Gateway";
        }

        String ip = ipAddress.trim();

        // 1. Loopback / Localhost
        if ("127.0.0.1".equals(ip) || "::1".equals(ip) || "0:0:0:0:0:0:0:1".equals(ip) || "localhost".equalsIgnoreCase(ip)) {
            return "Localhost / Internal Network";
        }

        // 2. Private Intranet Ranges
        if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("169.254.")) {
            return "Private Intranet Network";
        }
        if (ip.startsWith("172.")) {
            try {
                String[] parts = ip.split("\\.");
                int secondOctet = Integer.parseInt(parts[1]);
                if (secondOctet >= 16 && secondOctet <= 31) {
                    return "Docker Container / VPC Network";
                }
            } catch (Exception ignored) {}
        }

        // 3. Known Public ISP / Cloud IP prefixes
        if (ip.startsWith("118.68.") || ip.startsWith("118.69.") || ip.startsWith("14.160.") || ip.startsWith("14.232.") ||
            ip.startsWith("113.160.") || ip.startsWith("113.161.") || ip.startsWith("27.64.") || ip.startsWith("27.72.") ||
            ip.startsWith("171.224.") || ip.startsWith("123.16.") || ip.startsWith("42.112.")) {
            return "Ho Chi Minh City, Vietnam";
        }
        if (ip.startsWith("118.70.") || ip.startsWith("14.162.") || ip.startsWith("113.162.")) {
            return "Hanoi, Vietnam";
        }

        // 4. Global / Cloud Providers
        if (ip.startsWith("1.1.1.") || ip.startsWith("1.0.0.")) {
            return "Cloudflare Anycast (Global)";
        }
        if (ip.startsWith("8.8.8.") || ip.startsWith("8.8.4.")) {
            return "Google Anycast (United States)";
        }
        if (ip.startsWith("54.") || ip.startsWith("52.") || ip.startsWith("3.") || ip.startsWith("34.") || ip.startsWith("35.")) {
            return "United States (Cloud Gateway)";
        }

        // 5. Default Public IP format
        StringBuilder sb = new StringBuilder();
        sb.append("Public Internet (").append(ip).append(")");
        return sb.toString();
    }
}
