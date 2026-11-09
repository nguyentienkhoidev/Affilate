package com.heygoodly.portal.modules.affiliate.listener;

import com.heygoodly.portal.common.util.NullSafeUtils;
import com.heygoodly.portal.modules.affiliate.entity.AffiliateClickEntity;
import com.heygoodly.portal.modules.affiliate.event.AffiliateClickEvent;
import com.heygoodly.portal.modules.affiliate.repository.AffiliateClickRepository;
import com.heygoodly.portal.modules.store.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class AffiliateClickListener {

    private final StoreRepository storeRepository;
    private final AffiliateClickRepository affiliateClickRepository;

    /**
     * Handles affiliate click events asynchronously in a worker thread.
     * Prevents outbound HTTP 307 redirects from blocking on database updates.
     */
    @Async
    @EventListener
    @Transactional
    public void handleAffiliateClick(AffiliateClickEvent event) {
        try {
            log.info("Processing affiliate click async: storeId={}, offerId={}, ip={}, url={}",
                    event.getStoreId(), event.getOfferId(), event.getClientIp(), event.getTargetUrl());

            if (event.getStoreId() != null) {
                storeRepository.incrementVisitCount(event.getStoreId());
            }

            String clickCode = UUID.randomUUID().toString().replace("-", "");
            AffiliateClickEntity clickEntity = AffiliateClickEntity.builder()
                    .clickCode(clickCode)
                    .storeId(event.getStoreId())
                    .offerId(event.getOfferId())
                    .targetUrl(NullSafeUtils.safeTrim(event.getTargetUrl()))
                    .userIp(NullSafeUtils.safeTrim(event.getClientIp()))
                    .userAgent(NullSafeUtils.safeTrim(event.getUserAgent()))
                    .refererUrl(NullSafeUtils.safeTrim(event.getReferer()))
                    .createdAt(Instant.now())
                    .build();

            affiliateClickRepository.save(clickEntity);
        } catch (Exception e) {
            log.error("Failed to record affiliate click asynchronously: {}", e.getMessage(), e);
        }
    }
}

