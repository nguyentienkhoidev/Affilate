package com.bargorya.portal.modules.feedback.service;

import com.bargorya.portal.common.dto.PageResponse;
import com.bargorya.portal.modules.feedback.dto.request.FeedbackRequest;
import com.bargorya.portal.modules.feedback.dto.response.FeedbackResponse;
import org.springframework.data.domain.Pageable;

public interface FeedbackService {
    FeedbackResponse submitFeedback(FeedbackRequest request);
    PageResponse<FeedbackResponse> getFeedbacks(Pageable pageable);
    void markAsRead(Long id, boolean isRead);
    void deleteFeedback(Long id);
}
