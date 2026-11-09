package com.heygoodly.portal.modules.feedback.dto.request;

import com.heygoodly.portal.modules.feedback.enums.FeedbackType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Pageable;

import java.time.Instant;

/**
 * Parameter Object Pattern: Encapsulates query and filter parameters
 * into a single cohesive object, avoiding fragile multi-parameter method signatures.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackQueryCriteria {
    private Pageable pageable;
    private Boolean isRead;
    private FeedbackType type;
    private String search;
    private Instant fromDate;
    private Instant toDate;
}

