package com.heygoodly.portal.common.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Map;

@Slf4j
public final class UrlUtils {

    private UrlUtils() {}

    /**
     * Appends query parameters to a given base URL cleanly.
     * Preserves existing query parameters in baseUrl and strips empty/blank values.
     *
     * @param baseUrl the target URL string
     * @param queryParams map of query parameter key -> string array values
     * @return the combined URL with query string
     */
    public static String appendQueryParams(String baseUrl, Map<String, String[]> queryParams) {
        if (baseUrl == null || baseUrl.isBlank()) {
            return "";
        }
        if (queryParams == null || queryParams.isEmpty()) {
            return baseUrl.trim();
        }

        try {
            UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(baseUrl.trim());
            queryParams.forEach((key, values) -> {
                if (key != null && !key.isBlank() && values != null) {
                    for (String val : values) {
                        if (val != null && !val.isBlank()) {
                            builder.queryParam(key.trim(), val.trim());
                        }
                    }
                }
            });
            return builder.build().toUriString();
        } catch (Exception e) {
            log.warn("Failed to append query params to base URL [{}]: {}", baseUrl, e.getMessage());
            return baseUrl.trim();
        }
    }

    /**
     * Validates whether a given URL string is a valid absolute HTTP or HTTPS URL.
     */
    public static boolean isValidHttpUrl(String url) {
        if (url == null || url.isBlank()) {
            return false;
        }
        try {
            URI uri = URI.create(url.trim());
            String scheme = uri.getScheme();
            return "http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme);
        } catch (Exception e) {
            return false;
        }
    }
}

