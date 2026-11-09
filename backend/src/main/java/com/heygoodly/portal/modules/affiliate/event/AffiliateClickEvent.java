package com.heygoodly.portal.modules.affiliate.event;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.Map;

@Getter
@Builder
public class AffiliateClickEvent {

    private final Long storeId;
    private final Long offerId;
    private final String slug;
    private final String targetUrl;
    private final String clientIp;
    private final String userAgent;
    private final String referer;
    private final Map<String, String[]> queryParams;
    @Builder.Default
    private final Instant clickedAt = Instant.now();
}

