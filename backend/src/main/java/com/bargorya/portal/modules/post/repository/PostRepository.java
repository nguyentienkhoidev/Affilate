package com.bargorya.portal.modules.post.repository;

import com.bargorya.portal.modules.post.entity.PostEntity;
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

    @Modifying
    @Query("UPDATE PostEntity p SET p.viewCount = p.viewCount + 1 WHERE p.id = :id")
    void incrementViewCount(@Param("id") Long id);

    @Query("SELECT p FROM PostEntity p WHERE p.isActive = true AND p.isDeleted = false AND p.isFeatured = true ORDER BY p.publishedAt DESC")
    List<PostEntity> findFeaturedPosts(Pageable pageable);

    @Query("SELECT p FROM PostEntity p WHERE p.isActive = true AND p.isDeleted = false ORDER BY p.publishedAt DESC")
    List<PostEntity> findRecentPosts(Pageable pageable);

    @Query("SELECT p FROM PostEntity p WHERE p.isActive = true AND p.isDeleted = false AND p.category.id = :categoryId ORDER BY p.sortOrder ASC, p.publishedAt DESC")
    List<PostEntity> findByCategoryId(@Param("categoryId") Long categoryId, Pageable pageable);

    @Query("SELECT p FROM PostEntity p WHERE p.isActive = true AND p.isDeleted = false AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.excerpt) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<PostEntity> searchPosts(@Param("query") String query, Pageable pageable);
}
