package com.bargorya.portal.modules.feedback.service.impl;

import com.bargorya.portal.common.dto.PageResponse;
import com.bargorya.portal.common.exception.ResourceNotFoundException;
import com.bargorya.portal.modules.feedback.dto.request.FeedbackRequest;
import com.bargorya.portal.modules.feedback.dto.response.FeedbackResponse;
import com.bargorya.portal.modules.feedback.entity.FeedbackEntity;
import com.bargorya.portal.modules.feedback.repository.FeedbackRepository;
import com.bargorya.portal.modules.feedback.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;

    @Override
    @Transactional
    public FeedbackResponse submitFeedback(FeedbackRequest request) {
        FeedbackEntity feedback = FeedbackEntity.builder()
                .name(request.getName().trim())
                .email(request.getEmail().toLowerCase().trim())
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .message(request.getMessage().trim())
                .isRead(false)
                .build();

        FeedbackEntity saved = feedbackRepository.save(feedback);
        log.info("Feedback received from email: {}", saved.getEmail());
        return mapToFeedbackResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<FeedbackResponse> getFeedbacks(Pageable pageable) {
        Page<FeedbackEntity> page = feedbackRepository.findAllByOrderByCreatedAtDesc(pageable);
        List<FeedbackResponse> items = page.getContent().stream()
                .map(this::mapToFeedbackResponse)
                .toList();

        return PageResponse.of(items, page.getNumber(), page.getSize(), page.getTotalElements());
    }

    @Override
    @Transactional
    public void markAsRead(Long id, boolean isRead) {
        FeedbackEntity feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with id: " + id));
        feedback.setIsRead(isRead);
        feedbackRepository.save(feedback);
    }

    @Override
    @Transactional
    public void deleteFeedback(Long id) {
        FeedbackEntity feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with id: " + id));
        feedbackRepository.delete(feedback);
    }

    private FeedbackResponse mapToFeedbackResponse(FeedbackEntity entity) {
        return new FeedbackResponse(
                entity.getId(),
                entity.getName(),
                entity.getEmail(),
                entity.getPhone(),
                entity.getMessage(),
                Boolean.TRUE.equals(entity.getIsRead()),
                entity.getCreatedAt()
        );
    }
}
