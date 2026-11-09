package com.heygoodly.portal.modules.post.repository;

import com.heygoodly.portal.modules.post.entity.PostEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<PostEntity, Long>, JpaSpecificationExecutor<PostEntity> {
    Optional<PostEntity> findBySlugAndIsDeletedFalse(String slug);
    boolean existsBySlugAndIsDeletedFalse(String slug);
    boolean existsBySlugAndIdNotAndIsDeletedFalse(String slug, Long id);

    long countByIsActiveTrueAndIsDeletedFalse();
    long countByIsDeletedFalse();

    @Query("SELECT COUNT(p) FROM PostEntity p WHERE p.isDeleted = false AND p.isActive = true AND p.publishedAt <= CURRENT_TIMESTAMP")
    long countPublishedPosts();

    @Query("SELECT COUNT(p) FROM PostEntity p WHERE p.isDeleted = false AND p.isActive = true AND p.publishedAt > CURRENT_TIMESTAMP")
    long countScheduledPosts();

    @Query("SELECT COUNT(p) FROM PostEntity p WHERE p.isDeleted = false AND p.isActive = false")
    long countDraftPosts();

    @Query("SELECT p.categoryId, COUNT(p) FROM PostEntity p WHERE p.isDeleted = false AND p.categoryId IS NOT NULL GROUP BY p.categoryId")
    List<Object[]> countPostsGroupedByCategory();

    @Query("SELECT COUNT(p) FROM PostEntity p WHERE p.isDeleted = false AND p.categoryId = :categoryId")
    long countByCategoryIdAndIsDeletedFalse(@Param("categoryId") Long categoryId);

    @Query("SELECT COALESCE(SUM(p.viewCount), 0) FROM PostEntity p WHERE p.isDeleted = false")
    long sumTotalViews();

    @Modifying
    @Query("UPDATE PostEntity p SET p.viewCount = p.viewCount + 1 WHERE p.id = :id")
    void incrementViewCount(@Param("id") Long id);

    @Query("SELECT p FROM PostEntity p WHERE p.isActive = true AND p.isDeleted = false AND p.publishedAt <= CURRENT_TIMESTAMP AND p.isFeatured = true AND (p.categoryId IS NULL OR EXISTS (SELECT c.id FROM com.heygoodly.portal.modules.category.entity.CategoryEntity c WHERE c.id = p.categoryId AND c.isActive = true AND c.isDeleted = false)) ORDER BY p.publishedAt DESC")
    List<PostEntity> findFeaturedPosts(Pageable pageable);

    @Query("SELECT p FROM PostEntity p WHERE p.isActive = true AND p.isDeleted = false AND p.publishedAt <= CURRENT_TIMESTAMP AND (p.categoryId IS NULL OR EXISTS (SELECT c.id FROM com.heygoodly.portal.modules.category.entity.CategoryEntity c WHERE c.id = p.categoryId AND c.isActive = true AND c.isDeleted = false)) ORDER BY p.publishedAt DESC")
    List<PostEntity> findRecentPosts(Pageable pageable);

    @Query("SELECT p FROM PostEntity p WHERE p.isActive = true AND p.isDeleted = false AND p.publishedAt <= CURRENT_TIMESTAMP AND p.categoryId = :categoryId AND EXISTS (SELECT c.id FROM com.heygoodly.portal.modules.category.entity.CategoryEntity c WHERE c.id = p.categoryId AND c.isActive = true AND c.isDeleted = false) ORDER BY p.sortOrder ASC, p.publishedAt DESC")
    List<PostEntity> findByCategoryId(@Param("categoryId") Long categoryId, Pageable pageable);

    @Query("SELECT p FROM PostEntity p WHERE p.isActive = true AND p.isDeleted = false AND p.publishedAt <= CURRENT_TIMESTAMP AND (p.categoryId IS NULL OR EXISTS (SELECT c.id FROM com.heygoodly.portal.modules.category.entity.CategoryEntity c WHERE c.id = p.categoryId AND c.isActive = true AND c.isDeleted = false)) AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.excerpt) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<PostEntity> searchPosts(@Param("query") String query, Pageable pageable);

    @Query("SELECT p.metaKeywords FROM PostEntity p WHERE p.isActive = true AND p.isDeleted = false AND p.publishedAt <= CURRENT_TIMESTAMP AND p.metaKeywords IS NOT NULL AND p.metaKeywords <> '' AND (p.categoryId IS NULL OR EXISTS (SELECT c.id FROM com.heygoodly.portal.modules.category.entity.CategoryEntity c WHERE c.id = p.categoryId AND c.isActive = true AND c.isDeleted = false))")
    List<String> findActiveMetaKeywords();

    @Query("SELECT p.tags FROM PostEntity p WHERE p.isActive = true AND p.isDeleted = false AND p.publishedAt <= CURRENT_TIMESTAMP AND p.tags IS NOT NULL AND (p.categoryId IS NULL OR EXISTS (SELECT c.id FROM com.heygoodly.portal.modules.category.entity.CategoryEntity c WHERE c.id = p.categoryId AND c.isActive = true AND c.isDeleted = false))")
    List<String> findActiveTagsJson();
}
