package com.heygoodly.portal.modules.feedback.service;

import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.modules.feedback.dto.request.FeedbackRequest;
import com.heygoodly.portal.modules.feedback.dto.response.FeedbackResponse;
import org.springframework.data.domain.Pageable;

public interface FeedbackService {
    FeedbackResponse submitFeedback(FeedbackRequest request);
    PageResponse<FeedbackResponse> getFeedbacks(Pageable pageable);
    void markAsRead(Long id, boolean isRead);
    void deleteFeedback(Long id);
}
