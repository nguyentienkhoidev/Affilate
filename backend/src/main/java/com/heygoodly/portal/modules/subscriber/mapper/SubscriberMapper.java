package com.heygoodly.portal.modules.subscriber.mapper;

import com.heygoodly.portal.common.mapper.BaseMapper;
import com.heygoodly.portal.modules.subscriber.dto.response.SubscriberResponse;
import com.heygoodly.portal.modules.subscriber.entity.SubscriberEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Objects;

/**
 * Dedicated mapper for Newsletter Subscriber entities.
 * Implements BaseMapper and utilizes Stream API, lambda expressions, and method references.
 */
@Slf4j
@Component
public class SubscriberMapper implements BaseMapper<SubscriberEntity, SubscriberResponse, SubscriberResponse> {

    @Override
    public SubscriberResponse toDetailResponse(SubscriberEntity entity) {
        if (Objects.isNull(entity)) {
            return null;
        }

        String statusStr = Objects.nonNull(entity.getStatus()) ? entity.getStatus().name() : null;

        return SubscriberResponse.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .source(entity.getSource())
                .status(statusStr)
                .ipAddress(entity.getIpAddress())
                .createdAt(entity.getSubscribedAt())
                .subscribedAt(entity.getSubscribedAt())
                .unsubscribedAt(entity.getUnsubscribedAt())
                .build();
    }

    @Override
    public SubscriberResponse toSummaryResponse(SubscriberEntity entity) {
        return toDetailResponse(entity);
    }
}
