package com.heygoodly.portal.modules.subscriber.service.impl;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.constant.EntityFieldConstants;
import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.common.exception.ErrorCode;
import com.heygoodly.portal.common.exception.ResourceNotFoundException;
import com.heygoodly.portal.common.util.NullSafeUtils;
import com.heygoodly.portal.modules.subscriber.dto.request.SubscriberQueryCriteria;
import com.heygoodly.portal.modules.subscriber.dto.request.SubscriberRequest;
import com.heygoodly.portal.modules.subscriber.dto.response.SubscriberResponse;
import com.heygoodly.portal.modules.subscriber.entity.SubscriberEntity;
import com.heygoodly.portal.modules.subscriber.enums.SubscriberStatus;
import com.heygoodly.portal.modules.subscriber.mapper.SubscriberMapper;
import com.heygoodly.portal.modules.subscriber.repository.SubscriberRepository;
import com.heygoodly.portal.modules.subscriber.service.SubscriberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriberServiceImpl implements SubscriberService {

    private final SubscriberRepository subscriberRepository;
    private final SubscriberMapper subscriberMapper;

    @Override
    @Transactional
    public SubscriberResponse subscribe(SubscriberRequest request, String ipAddress) {
        String cleanEmail = NullSafeUtils.safeLowerTrim(request.getEmail());
        String cleanSource = NullSafeUtils.safeTrim(request.getSource());
        if (!StringUtils.hasText(cleanSource)) {
            cleanSource = "homepage_footer";
        }

        log.info("Processing newsletter subscription for email: {}, source: {}", cleanEmail, cleanSource);

        Optional<SubscriberEntity> existingOpt = subscriberRepository.findByEmail(cleanEmail);
        if (existingOpt.isPresent()) {
            SubscriberEntity existing = existingOpt.get();
            if (existing.getStatus() != SubscriberStatus.ACTIVE) {
                existing.setStatus(SubscriberStatus.ACTIVE);
                existing.setUnsubscribedAt(null);
                existing.setSource(cleanSource);
                if (StringUtils.hasText(ipAddress)) {
                    existing.setIpAddress(ipAddress);
                }
                SubscriberEntity saved = subscriberRepository.save(existing);
                log.info("Re-activated subscriber id={} for email: {}", saved.getId(), cleanEmail);
                return subscriberMapper.toDetailResponse(saved);
            }
            return subscriberMapper.toDetailResponse(existing);
        }

        SubscriberEntity newSubscriber = SubscriberEntity.builder()
                .email(cleanEmail)
                .source(cleanSource)
                .status(SubscriberStatus.ACTIVE)
                .ipAddress(ipAddress)
                .subscribedAt(Instant.now())
                .build();

        SubscriberEntity saved = subscriberRepository.save(newSubscriber);
        log.info("Successfully registered new subscriber id={} for email: {}", saved.getId(), cleanEmail);
        return subscriberMapper.toDetailResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SubscriberResponse> getSubscribers(SubscriberQueryCriteria criteria) {
        String search = NullSafeUtils.trimToNull(criteria.getSearch());
        String source = NullSafeUtils.trimToNull(criteria.getSource());

        log.info("Listing subscribers: search='{}', source='{}', status={}", search, source, criteria.getStatus());

        org.springframework.data.jpa.domain.Specification<SubscriberEntity> spec = (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            if (Objects.nonNull(criteria.getStatus())) {
                predicates.add(cb.equal(root.get(EntityFieldConstants.STATUS), criteria.getStatus()));
            }
            if (StringUtils.hasText(source)) {
                predicates.add(cb.equal(root.get(EntityFieldConstants.SOURCE), source));
            }
            if (StringUtils.hasText(search)) {
                String pattern = new StringBuilder(AppConstants.PERCENT)
                        .append(search.toLowerCase())
                        .append(AppConstants.PERCENT)
                        .toString();
                predicates.add(cb.like(cb.lower(root.get(EntityFieldConstants.EMAIL)), pattern));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<SubscriberEntity> page = subscriberRepository.findAll(spec, criteria.getPageable());
        List<SubscriberResponse> items = subscriberMapper.toSummaryResponseList(page.getContent());

        return PageResponse.of(items, page.getNumber(), page.getSize(), page.getTotalElements());
    }

    @Override
    @Transactional
    public void unsubscribe(Long id) {
        log.info("Unsubscribing subscriber id={}", id);
        SubscriberEntity entity = subscriberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.SUBSCRIBER_NOT_FOUND));

        entity.setStatus(SubscriberStatus.UNSUBSCRIBED);
        entity.setUnsubscribedAt(Instant.now());
        subscriberRepository.save(entity);
        log.info("Successfully unsubscribed subscriber id={}", id);
    }

    @Override
    @Transactional
    public void unsubscribeByEmail(String email) {
        String cleanEmail = NullSafeUtils.safeLowerTrim(email);
        log.info("Unsubscribing by email: {}", cleanEmail);
        SubscriberEntity entity = subscriberRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.SUBSCRIBER_NOT_FOUND));

        entity.setStatus(SubscriberStatus.UNSUBSCRIBED);
        entity.setUnsubscribedAt(Instant.now());
        subscriberRepository.save(entity);
        log.info("Successfully unsubscribed subscriber by email: {}", cleanEmail);
    }

    @Override
    @Transactional
    public void deleteSubscriber(Long id) {
        log.info("Deleting subscriber record id={}", id);
        if (!subscriberRepository.existsById(id)) {
            throw new ResourceNotFoundException(ErrorCode.SUBSCRIBER_NOT_FOUND);
        }
        subscriberRepository.deleteById(id);
        log.info("Successfully deleted subscriber record id={}", id);
    }
}
