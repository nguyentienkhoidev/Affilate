package com.heygoodly.portal.modules.media.repository;

import com.heygoodly.portal.modules.media.entity.MediaItemEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MediaItemRepository extends JpaRepository<MediaItemEntity, Long>, JpaSpecificationExecutor<MediaItemEntity> {

    Optional<MediaItemEntity> findByObjectKey(String objectKey);

    Optional<MediaItemEntity> findByUrl(String url);

    @Query(value = "SELECT * FROM media_items m WHERE " +
            "(:category IS NULL OR :category = '' OR :category = 'all' " +
            "  OR LOWER(m.category) = LOWER(:category) " +
            "  OR (:category = 'stores' AND (LOWER(m.category) LIKE 'store%' OR LOWER(m.object_key) LIKE 'store%' OR LOWER(CAST(m.tags AS TEXT)) LIKE '%\"store\"%' OR LOWER(CAST(m.tags AS TEXT)) LIKE '%\"stores\"%')) " +
            "  OR (:category = 'articles' AND (LOWER(m.category) LIKE 'article%' OR LOWER(m.category) = 'staff' OR LOWER(m.category) LIKE '%bài%' OR LOWER(m.object_key) LIKE 'article%' OR LOWER(CAST(m.tags AS TEXT)) LIKE '%\"article\"%' OR LOWER(CAST(m.tags AS TEXT)) LIKE '%\"articles\"%')) " +
            "  OR (:category = 'banners' AND (LOWER(m.category) LIKE '%banner%' OR LOWER(m.object_key) LIKE '%banner%' OR LOWER(CAST(m.tags AS TEXT)) LIKE '%\"banner\"%')) " +
            "  OR (:category = 'icons' AND (LOWER(m.category) LIKE 'icon%' OR LOWER(m.category) LIKE 'logo%' OR LOWER(m.object_key) LIKE '%icon%' OR LOWER(m.object_key) LIKE '%logo%' OR LOWER(CAST(m.tags AS TEXT)) LIKE '%\"icon\"%' OR LOWER(CAST(m.tags AS TEXT)) LIKE '%\"logo\"%')) " +
            ") AND " +
            "(:search IS NULL OR :search = '' " +
            "  OR LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "  OR LOWER(m.object_key) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "  OR LOWER(m.category) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "  OR LOWER(CAST(m.tags AS TEXT)) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "  OR LOWER(CAST(m.tags AS TEXT)) LIKE LOWER(CONCAT('%', REPLACE(:search, '#', ''), '%')) " +
            ") AND " +
            "(:tag IS NULL OR :tag = '' OR :tag = 'all' OR LOWER(CAST(m.tags AS TEXT)) LIKE LOWER(CONCAT('%\"', REPLACE(:tag, '#', ''), '\"%'))) AND " +
            "(:format IS NULL OR :format = '' OR :format = 'all' OR LOWER(m.name) LIKE LOWER(CONCAT('%.', :format)) OR LOWER(m.mime_type) LIKE LOWER(CONCAT('%', :format, '%')))",
            countQuery = "SELECT count(*) FROM media_items m WHERE " +
            "(:category IS NULL OR :category = '' OR :category = 'all' " +
            "  OR LOWER(m.category) = LOWER(:category) " +
            "  OR (:category = 'stores' AND (LOWER(m.category) LIKE 'store%' OR LOWER(m.object_key) LIKE 'store%' OR LOWER(CAST(m.tags AS TEXT)) LIKE '%\"store\"%' OR LOWER(CAST(m.tags AS TEXT)) LIKE '%\"stores\"%')) " +
            "  OR (:category = 'articles' AND (LOWER(m.category) LIKE 'article%' OR LOWER(m.category) = 'staff' OR LOWER(m.category) LIKE '%bài%' OR LOWER(m.object_key) LIKE 'article%' OR LOWER(CAST(m.tags AS TEXT)) LIKE '%\"article\"%' OR LOWER(CAST(m.tags AS TEXT)) LIKE '%\"articles\"%')) " +
            "  OR (:category = 'banners' AND (LOWER(m.category) LIKE '%banner%' OR LOWER(m.object_key) LIKE '%banner%' OR LOWER(CAST(m.tags AS TEXT)) LIKE '%\"banner\"%')) " +
            "  OR (:category = 'icons' AND (LOWER(m.category) LIKE 'icon%' OR LOWER(m.category) LIKE 'logo%' OR LOWER(m.object_key) LIKE '%icon%' OR LOWER(m.object_key) LIKE '%logo%' OR LOWER(CAST(m.tags AS TEXT)) LIKE '%\"icon\"%' OR LOWER(CAST(m.tags AS TEXT)) LIKE '%\"logo\"%')) " +
            ") AND " +
            "(:search IS NULL OR :search = '' " +
            "  OR LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "  OR LOWER(m.object_key) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "  OR LOWER(m.category) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "  OR LOWER(CAST(m.tags AS TEXT)) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "  OR LOWER(CAST(m.tags AS TEXT)) LIKE LOWER(CONCAT('%', REPLACE(:search, '#', ''), '%')) " +
            ") AND " +
            "(:tag IS NULL OR :tag = '' OR :tag = 'all' OR LOWER(CAST(m.tags AS TEXT)) LIKE LOWER(CONCAT('%\"', REPLACE(:tag, '#', ''), '\"%'))) AND " +
            "(:format IS NULL OR :format = '' OR :format = 'all' OR LOWER(m.name) LIKE LOWER(CONCAT('%.', :format)) OR LOWER(m.mime_type) LIKE LOWER(CONCAT('%', :format, '%')))",
            nativeQuery = true)
    Page<MediaItemEntity> findMediaByFilters(
            @Param("category") String category,
            @Param("search") String search,
            @Param("tag") String tag,
            @Param("format") String format,
            Pageable pageable
    );
}
