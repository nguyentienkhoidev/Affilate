package com.heygoodly.portal.modules.feedback.repository;

import com.heygoodly.portal.modules.feedback.entity.FeedbackEntity;
import com.heygoodly.portal.modules.feedback.enums.FeedbackType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedbackRepository extends JpaRepository<FeedbackEntity, Long> {
    Page<FeedbackEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByIsReadFalse();
    long countByIsReadFalseAndType(FeedbackType type);
    long countByIsReadFalseAndTypeNot(FeedbackType type);
}
