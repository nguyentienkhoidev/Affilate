package com.heygoodly.portal.modules.affiliate.controller;

import com.heygoodly.portal.common.constant.AffiliateConstants;
import com.heygoodly.portal.common.util.HttpHeaderUtils;
import com.heygoodly.portal.modules.affiliate.service.AffiliateRedirectService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
public class AffiliateRedirectController {

    private final AffiliateRedirectService affiliateRedirectService;

    /**
     * Resolves and executes a cloaked affiliate redirection for a merchant store by its slug.
     * Responds with HTTP 307 (Temporary Redirect) with X-Robots-Tag: noindex, nofollow.
     *
     * @param slug Merchant slug
     * @param request HttpServletRequest
     * @return ResponseEntity with cloaked redirect headers
     */
    @GetMapping(AffiliateConstants.REDIRECT_PATH_PREFIX_STORE + "{slug}")
    public ResponseEntity<Void> redirectStore(
            @PathVariable("slug") String slug,
            HttpServletRequest request
    ) {
        String finalUrl = affiliateRedirectService.resolveStoreRedirect(slug, request);
        HttpHeaders headers = HttpHeaderUtils.createCloakedRedirectHeaders(finalUrl);
        return new ResponseEntity<>(headers, HttpStatus.TEMPORARY_REDIRECT);
    }

    /**
     * Resolves and executes a cloaked affiliate redirection for a specific coupon / offer.
     * Responds with HTTP 307 (Temporary Redirect) with X-Robots-Tag: noindex, nofollow.
     *
     * @param offerId Offer ID
     * @param request HttpServletRequest
     * @return ResponseEntity with cloaked redirect headers
     */
    @GetMapping(AffiliateConstants.REDIRECT_PATH_PREFIX_OFFER + "{offerId}")
    public ResponseEntity<Void> redirectOffer(
            @PathVariable("offerId") Long offerId,
            HttpServletRequest request
    ) {
        String finalUrl = affiliateRedirectService.resolveOfferRedirect(offerId, request);
        HttpHeaders headers = HttpHeaderUtils.createCloakedRedirectHeaders(finalUrl);
        return new ResponseEntity<>(headers, HttpStatus.TEMPORARY_REDIRECT);
    }
}
