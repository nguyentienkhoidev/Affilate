package com.heygoodly.portal.modules.tag.repository;

import com.heygoodly.portal.modules.tag.entity.TagEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<TagEntity, Long> {

    @Query("SELECT t FROM TagEntity t WHERE t.isDeleted = false " +
           "AND (:search IS NULL OR :search = '' " +
           "     OR LOWER(t.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(t.slug) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:isFeatured IS NULL OR t.isFeatured = :isFeatured) " +
           "AND (:entityType IS NULL OR :entityType = '' OR :entityType = 'ALL' " +
           "     OR (:entityType = 'UNUSED' AND t.id NOT IN (SELECT et.tagId FROM EntityTagEntity et)) " +
           "     OR (:entityType <> 'UNUSED' AND t.id IN (SELECT et.tagId FROM EntityTagEntity et WHERE et.entityType = :entityType)))")
    Page<TagEntity> searchTags(
            @Param("search") String search,
            @Param("isFeatured") Boolean isFeatured,
            @Param("entityType") String entityType,
            Pageable pageable
    );

    @Query("SELECT t FROM TagEntity t WHERE t.isDeleted = false AND (LOWER(t.slug) IN :identifiers OR LOWER(t.name) IN :identifiers)")
    List<TagEntity> findBySlugInOrNameIn(@Param("identifiers") java.util.Collection<String> identifiers);

    Optional<TagEntity> findByIdAndIsDeletedFalse(Long id);

    Optional<TagEntity> findBySlugAndIsDeletedFalse(String slug);

    boolean existsBySlugAndIsDeletedFalse(String slug);

    boolean existsBySlugAndIdNotAndIsDeletedFalse(String slug, Long id);

    List<TagEntity> findByIsFeaturedTrueAndIsActiveTrueAndIsDeletedFalse();

    List<TagEntity> findByIsActiveTrueAndIsDeletedFalseOrderByNameAsc();

    @Query("SELECT t.name FROM TagEntity t WHERE t.isActive = true AND t.isDeleted = false ORDER BY t.isFeatured DESC, t.name ASC")
    List<String> findActiveTagNamesOrdered();

    long countByIsDeletedFalse();

    long countByIsFeaturedTrueAndIsDeletedFalse();

    @Query(value = "SELECT LOWER(TRIM(tag_val)), count(*) FROM (" +
                   "  SELECT jsonb_array_elements_text(p.tags) AS tag_val " +
                   "  FROM posts p " +
                   "  WHERE p.is_deleted = false AND p.tags IS NOT NULL" +
                   ") sub GROUP BY LOWER(TRIM(tag_val))", nativeQuery = true)
    List<Object[]> countPostsPerTag();

    @Query(value = "SELECT LOWER(TRIM(tag_val)), count(*) FROM (" +
                   "  SELECT jsonb_array_elements_text(m.tags) AS tag_val " +
                   "  FROM media_items m " +
                   "  WHERE m.tags IS NOT NULL" +
                   ") sub GROUP BY LOWER(TRIM(tag_val))", nativeQuery = true)
    List<Object[]> countMediaPerTag();
}

