package com.bargorya.portal.modules.offer.repository;

import com.bargorya.portal.modules.offer.entity.OfferEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfferRepository extends JpaRepository<OfferEntity, Long>, JpaSpecificationExecutor<OfferEntity> {
    List<OfferEntity> findByStoreIdAndIsActiveTrueAndIsDeletedFalseOrderBySortOrderAscCreatedAtDesc(Long storeId);

    @Query("SELECT o FROM OfferEntity o WHERE o.store.id = :storeId AND o.isActive = true AND o.isDeleted = false AND o.isVerified = true ORDER BY o.sortOrder ASC")
    List<OfferEntity> findVerifiedByStoreId(@Param("storeId") Long storeId);

    @Query("SELECT o FROM OfferEntity o WHERE o.store.id = :storeId AND o.isActive = true AND o.isDeleted = false AND o.code IS NOT NULL AND o.code <> '' ORDER BY o.sortOrder ASC")
    List<OfferEntity> findCodesByStoreId(@Param("storeId") Long storeId);

    @Query("SELECT o FROM OfferEntity o WHERE o.store.id = :storeId AND o.isActive = true AND o.isDeleted = false AND (o.code IS NULL OR o.code = '') ORDER BY o.sortOrder ASC")
    List<OfferEntity> findDealsByStoreId(@Param("storeId") Long storeId);

    long countByStoreIdAndIsActiveTrueAndIsDeletedFalse(Long storeId);

    Page<OfferEntity> findByStoreIdAndIsDeletedFalse(Long storeId, Pageable pageable);
}
