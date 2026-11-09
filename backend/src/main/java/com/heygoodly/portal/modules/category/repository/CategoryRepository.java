package com.heygoodly.portal.modules.category.repository;

import com.heygoodly.portal.modules.category.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryEntity, Long>, JpaSpecificationExecutor<CategoryEntity> {
    Optional<CategoryEntity> findBySlug(String slug);
    Optional<CategoryEntity> findBySlugAndIsDeletedFalse(String slug);
    List<CategoryEntity> findBySlugInAndIsDeletedFalse(java.util.Collection<String> slugs);
    boolean existsBySlugAndIsDeletedFalse(String slug);
    boolean existsBySlugAndIdNotAndIsDeletedFalse(String slug, Long id);
    List<CategoryEntity> findByIsActiveTrueAndIsDeletedFalseOrderBySortOrderAsc();
    List<CategoryEntity> findByTypeAndIsActiveTrueAndIsDeletedFalseOrderBySortOrderAsc(String type);
    List<CategoryEntity> findByShowOnHomeTrueAndIsActiveTrueAndIsDeletedFalseOrderBySortOrderAsc();
    long countByIsDeletedFalse();
    long countByIsActiveTrueAndIsDeletedFalse();
}
