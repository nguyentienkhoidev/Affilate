package com.heygoodly.portal.common.util;

import com.heygoodly.portal.common.constant.HttpHeaderConstants;
import org.springframework.http.HttpHeaders;

import java.net.URI;

public final class HttpHeaderUtils {

    private HttpHeaderUtils() {}

    /**
     * Creates HTTP response headers for affiliate cloaked redirects.
     * Enforces X-Robots-Tag to prevent search engines from indexing the affiliate target,
     * and disables intermediate cache proxying to ensure accurate real-time click tracking.
     *
     * @param targetUrl destination redirect URL
     * @return configured HttpHeaders
     */
    public static HttpHeaders createCloakedRedirectHeaders(String targetUrl) {
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(targetUrl));
        headers.set(HttpHeaderConstants.X_ROBOTS_TAG, HttpHeaderConstants.ROBOTS_NOINDEX_NOFOLLOW);
        headers.setCacheControl(HttpHeaderConstants.CACHE_CONTROL_NO_STORE);
        headers.setPragma(HttpHeaderConstants.PRAGMA_NO_CACHE);
        headers.setExpires(0L);
        return headers;
    }
}

