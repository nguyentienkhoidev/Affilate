package com.heygoodly.portal.modules.feedback.mapper;

import com.heygoodly.portal.common.mapper.BaseMapper;
import com.heygoodly.portal.common.util.NullSafeUtils;
import com.heygoodly.portal.modules.feedback.dto.response.FeedbackResponse;
import com.heygoodly.portal.modules.feedback.entity.FeedbackEntity;
import com.heygoodly.portal.modules.feedback.enums.FeedbackType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Objects;

/**
 * Dedicated mapper for User Feedback & Inquiries.
 * Implements BaseMapper and utilizes Stream API, lambda expressions, and method references.
 */
@Slf4j
@Component
public class FeedbackMapper implements BaseMapper<FeedbackEntity, FeedbackResponse, FeedbackResponse> {

    @Override
    public FeedbackResponse toDetailResponse(FeedbackEntity entity) {
        if (Objects.isNull(entity)) {
            return null;
        }

        String typeStr = Objects.nonNull(entity.getType()) ? entity.getType().name() : FeedbackType.GENERAL.name();

        return new FeedbackResponse(
                entity.getId(),
                entity.getName(),
                entity.getEmail(),
                entity.getPhone(),
                typeStr,
                entity.getMessage(),
                NullSafeUtils.safeBoolean(entity.getIsRead()),
                entity.getCreatedAt()
        );
    }

    @Override
    public FeedbackResponse toSummaryResponse(FeedbackEntity entity) {
        return toDetailResponse(entity);
    }
}

