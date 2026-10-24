package com.bargorya.portal.modules.feedback.repository;

import com.bargorya.portal.modules.feedback.entity.FeedbackEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedbackRepository extends JpaRepository<FeedbackEntity, Long> {
    Page<FeedbackEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
