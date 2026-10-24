package com.bargorya.portal.modules.store.repository;

import com.bargorya.portal.modules.store.entity.StoreEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StoreRepository extends JpaRepository<StoreEntity, Long>, JpaSpecificationExecutor<StoreEntity> {
    Optional<StoreEntity> findBySlugAndIsDeletedFalse(String slug);
    boolean existsBySlugAndIsDeletedFalse(String slug);
    boolean existsBySlugAndIdNotAndIsDeletedFalse(String slug, Long id);

    @Modifying
    @Query("UPDATE StoreEntity s SET s.afVisitCount = s.afVisitCount + 1 WHERE s.id = :id")
    void incrementVisitCount(@Param("id") Long id);

    Page<StoreEntity> findByIsActiveTrueAndIsDeletedFalse(Pageable pageable);

    @Query("SELECT s FROM StoreEntity s WHERE s.isActive = true AND s.isDeleted = false AND " +
           "(LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(s.slug) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<StoreEntity> searchActiveStores(@Param("query") String query, Pageable pageable);
}
