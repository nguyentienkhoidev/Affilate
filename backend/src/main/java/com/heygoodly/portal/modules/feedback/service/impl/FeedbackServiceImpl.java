package com.heygoodly.portal.modules.feedback.service.impl;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.common.exception.AppException;
import com.heygoodly.portal.common.exception.ErrorCode;
import com.heygoodly.portal.common.util.NullSafeUtils;
import com.heygoodly.portal.modules.feedback.dto.request.FeedbackQueryCriteria;
import com.heygoodly.portal.modules.feedback.dto.request.FeedbackRequest;
import com.heygoodly.portal.modules.feedback.dto.response.FeedbackResponse;
import com.heygoodly.portal.modules.feedback.entity.FeedbackEntity;
import com.heygoodly.portal.modules.feedback.enums.FeedbackType;
import com.heygoodly.portal.modules.feedback.mapper.FeedbackMapper;
import com.heygoodly.portal.modules.feedback.repository.FeedbackRepository;
import com.heygoodly.portal.modules.feedback.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final FeedbackMapper feedbackMapper;

    @Override
    @Transactional
    public FeedbackResponse submitFeedback(FeedbackRequest request) {
        if (Objects.isNull(request)) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        log.info("Received new customer feedback submission from email: {}", request.getEmail());

        String safeName = NullSafeUtils.safeTrim(request.getName());
        String safeEmail = NullSafeUtils.safeLowerTrim(request.getEmail());
        String safeMessage = NullSafeUtils.safeTrim(request.getMessage());
        String safePhone = NullSafeUtils.trimToNull(request.getPhone());

        FeedbackEntity feedback = FeedbackEntity.builder()
                .name(safeName)
                .email(safeEmail)
                .phone(safePhone)
                .type(FeedbackType.GENERAL)
                .message(safeMessage)
                .isRead(false)
                .build();

        FeedbackEntity saved = feedbackRepository.save(feedback);
        log.info("Successfully recorded feedback id={} from email: {}", saved.getId(), saved.getEmail());
        return feedbackMapper.toDetailResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<FeedbackResponse> getFeedbacks(Pageable pageable) {
        Pageable safePageable = Objects.nonNull(pageable) ? pageable : PageRequest.of(AppConstants.DEFAULT_PAGE_NUMBER, AppConstants.DEFAULT_PAGE_SIZE);
        log.info("Listing customer feedback items: page={}, size={}", safePageable.getPageNumber(), safePageable.getPageSize());
        Page<FeedbackEntity> page = feedbackRepository.findAllByOrderByCreatedAtDesc(safePageable);

        List<FeedbackResponse> items = feedbackMapper.toSummaryResponseList(page.getContent());
        return PageResponse.of(items, page.getNumber(), page.getSize(), page.getTotalElements());
    }

    /**
     * Parameter Object Pattern: Handles multiple dynamic filtering criteria without parameter explosion.
     */
    @Transactional(readOnly = true)
    public PageResponse<FeedbackResponse> searchFeedbacks(FeedbackQueryCriteria criteria) {
        FeedbackQueryCriteria safeCriteria = Objects.nonNull(criteria) ? criteria : new FeedbackQueryCriteria();
        Pageable safePageable = Objects.nonNull(safeCriteria.getPageable())
                ? safeCriteria.getPageable()
                : PageRequest.of(AppConstants.DEFAULT_PAGE_NUMBER, AppConstants.DEFAULT_PAGE_SIZE);

        log.info("Searching feedback criteria: page={}, size={}", safePageable.getPageNumber(), safePageable.getPageSize());
        Page<FeedbackEntity> page = feedbackRepository.findAllByOrderByCreatedAtDesc(safePageable);
        List<FeedbackResponse> items = feedbackMapper.toSummaryResponseList(page.getContent());

        return PageResponse.of(items, page.getNumber(), page.getSize(), page.getTotalElements());
    }

    @Override
    @Transactional
    public void markAsRead(Long id, boolean isRead) {
        if (Objects.isNull(id)) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        log.info("Marking feedback id={} as read={}", id, isRead);
        FeedbackEntity feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        feedback.setIsRead(isRead);
        feedbackRepository.save(feedback);
        log.info("Successfully marked feedback id={} as read={}", id, isRead);
    }

    @Override
    @Transactional
    public void deleteFeedback(Long id) {
        if (Objects.isNull(id)) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        log.info("Deleting feedback id={}", id);
        FeedbackEntity feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        feedbackRepository.delete(feedback);
        log.info("Successfully deleted feedback id={}", id);
    }
}
