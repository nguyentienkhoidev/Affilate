package com.bargorya.portal.modules.category.repository;

import com.bargorya.portal.modules.category.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryEntity, Long>, JpaSpecificationExecutor<CategoryEntity> {
    Optional<CategoryEntity> findBySlugAndIsDeletedFalse(String slug);
    boolean existsBySlugAndIsDeletedFalse(String slug);
    boolean existsBySlugAndIdNotAndIsDeletedFalse(String slug, Long id);
    List<CategoryEntity> findByTypeAndIsActiveTrueAndIsDeletedFalseOrderBySortOrderAsc(String type);
    List<CategoryEntity> findByShowOnHomeTrueAndIsActiveTrueAndIsDeletedFalseOrderBySortOrderAsc();
}
