package com.heygoodly.portal.modules.affiliate.service;

import jakarta.servlet.http.HttpServletRequest;

public interface AffiliateRedirectService {

    /**
     * Resolves the outbound cloaked affiliate destination URL for a merchant store.
     * Fires an asynchronous AffiliateClickEvent for analytics and counter incrementing.
     *
     * @param slug merchant slug identifier
     * @param request current HTTP request
     * @return final destination URL with appended tracking query parameters
     */
    String resolveStoreRedirect(String slug, HttpServletRequest request);

    /**
     * Resolves the outbound cloaked affiliate destination URL for an individual offer/coupon.
     * Fires an asynchronous AffiliateClickEvent for analytics and counter incrementing.
     *
     * @param offerId unique offer identifier
     * @param request current HTTP request
     * @return final destination URL with appended tracking query parameters
     */
    String resolveOfferRedirect(Long offerId, HttpServletRequest request);
}

