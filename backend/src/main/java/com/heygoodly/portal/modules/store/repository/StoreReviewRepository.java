package com.heygoodly.portal.modules.store.repository;

import com.heygoodly.portal.modules.store.entity.StoreReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoreReviewRepository extends JpaRepository<StoreReviewEntity, Long> {

    List<StoreReviewEntity> findByStoreIdAndIsDeletedFalseOrderBySortOrderAscIdAsc(Long storeId);

    void deleteByStoreId(Long storeId);
}
