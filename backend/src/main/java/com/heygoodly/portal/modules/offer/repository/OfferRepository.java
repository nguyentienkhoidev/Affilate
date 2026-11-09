package com.heygoodly.portal.modules.offer.repository;

import com.heygoodly.portal.modules.offer.entity.OfferEntity;
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

    @Query("SELECT o FROM OfferEntity o WHERE o.storeId = :storeId AND o.isActive = true AND o.isDeleted = false AND o.isVerified = true ORDER BY o.sortOrder ASC")
    List<OfferEntity> findVerifiedByStoreId(@Param("storeId") Long storeId);

    @Query("SELECT o FROM OfferEntity o WHERE o.storeId = :storeId AND o.isActive = true AND o.isDeleted = false AND o.code IS NOT NULL AND o.code <> '' ORDER BY o.sortOrder ASC")
    List<OfferEntity> findCodesByStoreId(@Param("storeId") Long storeId);

    @Query("SELECT o FROM OfferEntity o WHERE o.storeId = :storeId AND o.isActive = true AND o.isDeleted = false AND (o.code IS NULL OR o.code = '') ORDER BY o.sortOrder ASC")
    List<OfferEntity> findDealsByStoreId(@Param("storeId") Long storeId);

    long countByStoreIdAndIsActiveTrueAndIsDeletedFalse(Long storeId);

    @Query("SELECT o.storeId, COUNT(o.id) FROM OfferEntity o WHERE o.storeId IN :storeIds AND o.isActive = true AND o.isDeleted = false GROUP BY o.storeId")
    List<Object[]> countActiveOffersByStoreIds(@Param("storeIds") java.util.Collection<Long> storeIds);

    long countByIsActiveTrueAndIsDeletedFalse();

    long countByIsActiveTrueAndIsVerifiedTrueAndIsDeletedFalse();

    @Query("SELECT COUNT(o) FROM OfferEntity o WHERE o.isActive = true AND o.isDeleted = false AND o.code IS NOT NULL AND o.code <> ''")
    long countCouponCodes();

    @Query("SELECT COUNT(o) FROM OfferEntity o WHERE o.isActive = true AND o.isDeleted = false AND (o.code IS NULL OR o.code = '')")
    long countDeals();

    Page<OfferEntity> findByIsActiveTrueAndIsDeletedFalse(Pageable pageable);

    Page<OfferEntity> findByStoreIdAndIsDeletedFalse(Long storeId, Pageable pageable);
}
