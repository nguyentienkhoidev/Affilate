package com.bargorya.portal.modules.affiliate.controller;

import com.bargorya.portal.common.exception.ResourceNotFoundException;
import com.bargorya.portal.modules.offer.entity.OfferEntity;
import com.bargorya.portal.modules.offer.repository.OfferRepository;
import com.bargorya.portal.modules.store.entity.StoreEntity;
import com.bargorya.portal.modules.store.repository.StoreRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
public class AffiliateRedirectController {

    private final StoreRepository storeRepository;
    private final OfferRepository offerRepository;

    @GetMapping("/go/{slug}")
    @Transactional
    public ResponseEntity<Void> redirectStore(
            @PathVariable("slug") String slug,
            HttpServletRequest request
    ) {
        StoreEntity store = storeRepository.findBySlugAndIsDeletedFalse(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "slug", slug));

        storeRepository.incrementVisitCount(store.getId());

        String targetUrl = (store.getAfWebsite() != null && !store.getAfWebsite().isBlank())
                ? store.getAfWebsite()
                : "https://google.com";

        String finalUrl = appendTrackingParams(targetUrl, request.getParameterMap());
        log.info("Affiliate cloaked redirect for store [{}]: {}", slug, finalUrl);

        HttpHeaders headers = createNoRobotsRedirectHeaders(finalUrl);
        return new ResponseEntity<>(headers, HttpStatus.TEMPORARY_REDIRECT); // HTTP 307
    }

    @GetMapping("/out/{offerId}")
    @Transactional
    public ResponseEntity<Void> redirectOffer(
            @PathVariable("offerId") Long offerId,
            HttpServletRequest request
    ) {
        OfferEntity offer = offerRepository.findById(offerId)
                .filter(o -> !Boolean.TRUE.equals(o.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Offer", "id", offerId));

        if (offer.getStore() != null) {
            storeRepository.incrementVisitCount(offer.getStore().getId());
        }

        String targetUrl = (offer.getUrlRef() != null && !offer.getUrlRef().isBlank())
                ? offer.getUrlRef()
                : (offer.getStore() != null && offer.getStore().getAfWebsite() != null ? offer.getStore().getAfWebsite() : "/");

        String finalUrl = appendTrackingParams(targetUrl, request.getParameterMap());
        log.info("Affiliate cloaked redirect for offer [{}]: {}", offerId, finalUrl);

        HttpHeaders headers = createNoRobotsRedirectHeaders(finalUrl);
        return new ResponseEntity<>(headers, HttpStatus.TEMPORARY_REDIRECT); // HTTP 307
    }

    private HttpHeaders createNoRobotsRedirectHeaders(String targetUrl) {
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(targetUrl));
        headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
        headers.setCacheControl("no-cache, no-store, must-revalidate");
        return headers;
    }

    private String appendTrackingParams(String baseUrl, Map<String, String[]> queryParams) {
        if (queryParams == null || queryParams.isEmpty()) {
            return baseUrl;
        }

        try {
            UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(baseUrl);
            queryParams.forEach((key, values) -> {
                if (values != null && values.length > 0 && values[0] != null && !values[0].isBlank()) {
                    builder.queryParam(key, values[0]);
                }
            });
            return builder.build().toUriString();
        } catch (Exception e) {
            return baseUrl;
        }
    }
}
