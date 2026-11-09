package com.heygoodly.portal.modules.subscriber.repository;

import com.heygoodly.portal.modules.subscriber.entity.SubscriberEntity;
import com.heygoodly.portal.modules.subscriber.enums.SubscriberStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubscriberRepository extends JpaRepository<SubscriberEntity, Long>, JpaSpecificationExecutor<SubscriberEntity> {

    Optional<SubscriberEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByStatus(SubscriberStatus status);

    @Query("SELECT s FROM SubscriberEntity s WHERE "
            + "(:status IS NULL OR s.status = :status) AND "
            + "(:source IS NULL OR s.source = :source) AND "
            + "(:search IS NULL OR LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<SubscriberEntity> searchSubscribers(
            @Param("status") SubscriberStatus status,
            @Param("source") String source,
            @Param("search") String search,
            Pageable pageable
    );
}

