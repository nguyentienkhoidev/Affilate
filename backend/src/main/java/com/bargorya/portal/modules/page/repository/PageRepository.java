package com.bargorya.portal.modules.page.repository;

import com.bargorya.portal.modules.page.entity.PageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PageRepository extends JpaRepository<PageEntity, Long>, JpaSpecificationExecutor<PageEntity> {
    Optional<PageEntity> findBySlugAndIsActiveTrueAndIsDeletedFalse(String slug);
    Optional<PageEntity> findBySlugAndIsDeletedFalse(String slug);
    boolean existsBySlugAndIsDeletedFalse(String slug);
    boolean existsBySlugAndIdNotAndIsDeletedFalse(String slug, Long id);
}
