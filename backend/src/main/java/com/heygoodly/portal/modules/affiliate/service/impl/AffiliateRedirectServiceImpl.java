package com.heygoodly.portal.modules.affiliate.service.impl;

import com.heygoodly.portal.common.constant.AffiliateConstants;
import com.heygoodly.portal.common.constant.HttpHeaderConstants;
import com.heygoodly.portal.common.exception.ResourceNotFoundException;
import com.heygoodly.portal.common.util.NetworkUtils;
import com.heygoodly.portal.common.util.UrlUtils;
import com.heygoodly.portal.modules.affiliate.event.AffiliateClickEvent;
import com.heygoodly.portal.modules.affiliate.service.AffiliateRedirectService;
import com.heygoodly.portal.modules.offer.entity.OfferEntity;
import com.heygoodly.portal.modules.offer.repository.OfferRepository;
import com.heygoodly.portal.modules.store.entity.StoreEntity;
import com.heygoodly.portal.modules.store.repository.StoreRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AffiliateRedirectServiceImpl implements AffiliateRedirectService {

    private final StoreRepository storeRepository;
    private final OfferRepository offerRepository;
    private final ApplicationEventPublisher eventPublisher;

    private static final String ENTITY_STORE = "Store";
    private static final String ENTITY_OFFER = "Offer";
    private static final String FIELD_SLUG = "slug";
    private static final String FIELD_ID = "id";

    @Override
    public String resolveStoreRedirect(String slug, HttpServletRequest request) {
        StoreEntity store = storeRepository.findBySlugAndIsDeletedFalse(slug)
                .filter(s -> Boolean.TRUE.equals(s.getIsActive()))
                .orElseThrow(() -> new ResourceNotFoundException(ENTITY_STORE, FIELD_SLUG, slug));

        String rawTargetUrl = (store.getAfWebsite() != null && !store.getAfWebsite().isBlank())
                ? store.getAfWebsite()
                : AffiliateConstants.DEFAULT_FALLBACK_URL;

        String finalUrl = UrlUtils.appendQueryParams(rawTargetUrl, request.getParameterMap());

        // Publish event asynchronously without blocking HTTP response
        publishClickEvent(store.getId(), null, slug, finalUrl, request);

        log.info("Resolved store redirect: slug={}, targetUrl={}", slug, finalUrl);
        return finalUrl;
    }

    @Override
    public String resolveOfferRedirect(Long offerId, HttpServletRequest request) {
        OfferEntity offer = offerRepository.findById(offerId)
                .filter(o -> !Boolean.TRUE.equals(o.getIsDeleted()) && Boolean.TRUE.equals(o.getIsActive()))
                .orElseThrow(() -> new ResourceNotFoundException(ENTITY_OFFER, FIELD_ID, offerId));

        Long storeId = offer.getStoreId();
        StoreEntity parentStore = null;
        if (storeId != null) {
            parentStore = storeRepository.findById(storeId)
                    .filter(s -> !Boolean.TRUE.equals(s.getIsDeleted()) && Boolean.TRUE.equals(s.getIsActive()))
                    .orElseThrow(() -> new ResourceNotFoundException(ENTITY_OFFER, FIELD_ID, offerId));
        }

        String rawTargetUrl;
        if (offer.getUrlRef() != null && !offer.getUrlRef().isBlank()) {
            rawTargetUrl = offer.getUrlRef();
        } else if (parentStore != null && parentStore.getAfWebsite() != null && !parentStore.getAfWebsite().isBlank()) {
            rawTargetUrl = parentStore.getAfWebsite();
        } else {
            rawTargetUrl = AffiliateConstants.DEFAULT_FALLBACK_URL;
        }

        String finalUrl = UrlUtils.appendQueryParams(rawTargetUrl, request.getParameterMap());

        // Publish event asynchronously without blocking HTTP response
        publishClickEvent(storeId, offerId, null, finalUrl, request);

        log.info("Resolved offer redirect: offerId={}, storeId={}, targetUrl={}", offerId, storeId, finalUrl);
        return finalUrl;
    }

    private void publishClickEvent(Long storeId, Long offerId, String slug, String targetUrl, HttpServletRequest request) {
        AffiliateClickEvent event = AffiliateClickEvent.builder()
                .storeId(storeId)
                .offerId(offerId)
                .slug(slug)
                .targetUrl(targetUrl)
                .clientIp(NetworkUtils.getClientIp(request))
                .userAgent(request.getHeader(HttpHeaderConstants.HEADER_USER_AGENT))
                .referer(request.getHeader(HttpHeaderConstants.HEADER_REFERER))
                .queryParams(request.getParameterMap())
                .build();

        eventPublisher.publishEvent(event);
    }
}

