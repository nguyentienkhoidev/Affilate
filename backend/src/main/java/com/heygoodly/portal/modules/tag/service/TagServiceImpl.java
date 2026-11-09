package com.heygoodly.portal.modules.tag.service;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.constant.EntityFieldConstants;
import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.common.exception.AppException;
import com.heygoodly.portal.common.exception.ErrorCode;
import com.heygoodly.portal.common.util.NullSafeUtils;
import com.heygoodly.portal.common.util.SlugUtils;
import com.heygoodly.portal.modules.audit.dto.request.CreateAuditLogRequest;
import com.heygoodly.portal.modules.audit.service.AuditLogService;
import com.heygoodly.portal.modules.tag.dto.TagRequest;
import com.heygoodly.portal.modules.tag.dto.TagResponse;
import com.heygoodly.portal.modules.tag.entity.EntityTagEntity;
import com.heygoodly.portal.modules.tag.entity.TagEntity;
import com.heygoodly.portal.modules.tag.repository.EntityTagRepository;
import com.heygoodly.portal.modules.tag.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TagServiceImpl implements TagService {

    private static final String DEFAULT_COLOR = com.heygoodly.portal.common.constant.AppConstants.DEFAULT_TAG_COLOR;
    private static final String MODULE_TAG = "Tag";

    private final TagRepository tagRepository;
    private final EntityTagRepository entityTagRepository;
    private final AuditLogService auditLogService;
    private final com.heygoodly.portal.modules.tag.mapper.TagMapper tagMapper;

    @Override
    public PageResponse<TagResponse> getTags(String search, Boolean isFeatured, String entityType, Pageable pageable) {
        String cleanSearch = NullSafeUtils.safeTrim(search);
        String cleanType = NullSafeUtils.safeTrim(entityType).toUpperCase();
        if (cleanType.isEmpty() || "ALL".equals(cleanType)) {
            cleanType = null;
        }
        Page<TagEntity> page = tagRepository.searchTags(cleanSearch, isFeatured, cleanType, pageable);

        Map<Long, Map<String, Long>> groupedCounts = getEntityCountsGrouped();
        Map<String, Long> postCountFallback = getPostCountsMap();
        Map<String, Long> mediaCountFallback = getMediaCountsMap();

        List<TagResponse> content = page.getContent().stream()
                .map(entity -> mapToResponseWithCounts(entity, groupedCounts, postCountFallback, mediaCountFallback))
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast(),
                page.hasNext(),
                page.hasPrevious()
        );
    }

    @Override
    public TagResponse getTagById(Long id) {
        TagEntity entity = tagRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        return mapToResponse(entity);
    }

    @Override
    public TagResponse getTagBySlug(String slug) {
        TagEntity entity = tagRepository.findBySlugAndIsDeletedFalse(NullSafeUtils.safeLowerTrim(slug))
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        return mapToResponse(entity);
    }

    @Override
    @Transactional
    public TagResponse createTag(TagRequest request, String currentUsername) {
        String cleanName = NullSafeUtils.safeTrim(request.getName());
        if (cleanName.isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        String rawSlug = NullSafeUtils.safeTrim(request.getSlug());
        String cleanSlug = rawSlug.isEmpty() ? SlugUtils.toSlug(cleanName) : SlugUtils.toSlug(rawSlug);

        if (tagRepository.existsBySlugAndIsDeletedFalse(cleanSlug)) {
            throw new AppException(ErrorCode.DUPLICATE_RESOURCE);
        }

        String cleanColor = NullSafeUtils.safeTrim(request.getColor());
        if (cleanColor.isEmpty()) {
            cleanColor = DEFAULT_COLOR;
        }

        TagEntity entity = TagEntity.builder()
                .name(cleanName)
                .slug(cleanSlug)
                .description(NullSafeUtils.safeTrim(request.getDescription()))
                .color(cleanColor)
                .isFeatured(NullSafeUtils.safeBoolean(request.getIsFeatured()))
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        entity.setCreatedBy(currentUsername != null ? currentUsername : "system");
        TagEntity saved = tagRepository.save(entity);

        auditLogService.recordLog(CreateAuditLogRequest.builder()
                .action("CREATE")
                .module(MODULE_TAG)
                .resourceId(String.valueOf(saved.getId()))
                .resourceName(saved.getName())
                .userEmail(currentUsername)
                .status("SUCCESS")
                .build());

        log.info("Created tag: id={}, name='{}', slug='{}' by user: {}", saved.getId(), saved.getName(), saved.getSlug(), currentUsername);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public TagResponse updateTag(Long id, TagRequest request, String currentUsername) {
        TagEntity entity = tagRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        String cleanName = NullSafeUtils.safeTrim(request.getName());
        if (cleanName.isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        String rawSlug = NullSafeUtils.safeTrim(request.getSlug());
        String cleanSlug = rawSlug.isEmpty() ? SlugUtils.toSlug(cleanName) : SlugUtils.toSlug(rawSlug);

        if (tagRepository.existsBySlugAndIdNotAndIsDeletedFalse(cleanSlug, id)) {
            throw new AppException(ErrorCode.DUPLICATE_RESOURCE);
        }

        entity.setName(cleanName);
        entity.setSlug(cleanSlug);
        entity.setDescription(NullSafeUtils.safeTrim(request.getDescription()));

        String cleanColor = NullSafeUtils.safeTrim(request.getColor());
        if (!cleanColor.isEmpty()) {
            entity.setColor(cleanColor);
        }

        if (request.getIsFeatured() != null) {
            entity.setIsFeatured(request.getIsFeatured());
        }
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }

        TagEntity updated = tagRepository.save(entity);

        auditLogService.recordLog(CreateAuditLogRequest.builder()
                .action("UPDATE")
                .module(MODULE_TAG)
                .resourceId(String.valueOf(updated.getId()))
                .resourceName(updated.getName())
                .userEmail(currentUsername)
                .status("SUCCESS")
                .build());

        log.info("Updated tag: id={}, name='{}', slug='{}' by user: {}", updated.getId(), updated.getName(), updated.getSlug(), currentUsername);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteTag(Long id, String currentUsername) {
        TagEntity entity = tagRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        entity.setIsDeleted(true);
        tagRepository.save(entity);

        auditLogService.recordLog(CreateAuditLogRequest.builder()
                .action("DELETE")
                .module(MODULE_TAG)
                .resourceId(String.valueOf(id))
                .resourceName(entity.getName())
                .userEmail(currentUsername)
                .status("SUCCESS")
                .build());

        log.info("Deleted tag: id={}, name='{}' by user: {}", id, entity.getName(), currentUsername);
    }

    @Override
    public List<TagResponse> getFeaturedTags() {
        return tagRepository.findByIsFeaturedTrueAndIsActiveTrueAndIsDeletedFalse().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TagResponse> getAllActiveTags() {
        Map<Long, Map<String, Long>> groupedCounts = getEntityCountsGrouped();
        Map<String, Long> postCountFallback = getPostCountsMap();
        Map<String, Long> mediaCountFallback = getMediaCountsMap();
        return tagRepository.findByIsActiveTrueAndIsDeletedFalseOrderByNameAsc().stream()
                .map(entity -> mapToResponseWithCounts(entity, groupedCounts, postCountFallback, mediaCountFallback))
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getTrendingTagNames() {
        return tagRepository.findActiveTagNamesOrdered();
    }

    @Override
    @Transactional
    public List<String> syncEntityTags(String entityType, Long entityId, List<String> rawTags) {
        if (entityType == null || entityId == null) {
            return Collections.emptyList();
        }
        String cleanType = entityType.trim().toUpperCase();
        entityTagRepository.deleteByEntityTypeAndEntityId(cleanType, entityId);

        if (rawTags == null || rawTags.isEmpty()) {
            return Collections.emptyList();
        }

        Set<String> cleanTagNames = new LinkedHashSet<>();
        for (String raw : rawTags) {
            if (raw != null) {
                String trimmed = raw.trim().replaceAll("^#+", "").trim();
                if (!trimmed.isEmpty()) {
                    cleanTagNames.add(trimmed);
                }
            }
        }

        if (cleanTagNames.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> result = new ArrayList<>();
        for (String tagName : cleanTagNames) {
            String slug = SlugUtils.toSlug(tagName);
            if (slug.isEmpty()) {
                continue;
            }

            TagEntity tag = tagRepository.findBySlugAndIsDeletedFalse(slug)
                    .orElseGet(() -> {
                        TagEntity newTag = TagEntity.builder()
                                .name(tagName)
                                .slug(slug)
                                .color(DEFAULT_COLOR)
                                .isFeatured(false)
                                .isActive(true)
                                .description("Taxonomy tag for " + tagName)
                                .build();
                        newTag.setCreatedBy("system");
                        return tagRepository.save(newTag);
                    });

            EntityTagEntity mapping = EntityTagEntity.builder()
                    .entityType(cleanType)
                    .entityId(entityId)
                    .tagId(tag.getId())
                    .createdAt(Instant.now())
                    .build();
            entityTagRepository.save(mapping);
            result.add(tag.getName());
        }

        return result;
    }

    @Override
    public List<String> getEntityTagNames(String entityType, Long entityId) {
        if (entityType == null || entityId == null) {
            return Collections.emptyList();
        }
        List<EntityTagEntity> mappings = entityTagRepository.findByEntityTypeAndEntityId(entityType.trim().toUpperCase(), entityId);
        if (mappings.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> tagIds = mappings.stream().map(EntityTagEntity::getTagId).collect(Collectors.toList());
        return tagRepository.findAllById(tagIds).stream()
                .filter(t -> !NullSafeUtils.safeBoolean(t.getIsDeleted()) && NullSafeUtils.safeBoolean(t.getIsActive()))
                .map(TagEntity::getName)
                .collect(Collectors.toList());
    }

    private TagResponse mapToResponse(TagEntity entity) {
        return mapToResponseWithCounts(entity, Collections.emptyMap(), Collections.emptyMap(), Collections.emptyMap());
    }

    private Map<Long, Map<String, Long>> getEntityCountsGrouped() {
        Map<Long, Map<String, Long>> map = new HashMap<>();
        try {
            List<Object[]> rows = entityTagRepository.countGroupedByTagAndEntityType();
            for (Object[] row : rows) {
                if (row != null && row.length >= 3 && row[0] != null && row[1] != null && row[2] != null) {
                    Long tagId = ((Number) row[0]).longValue();
                    String type = String.valueOf(row[1]).toUpperCase().trim();
                    Long count = ((Number) row[2]).longValue();
                    map.computeIfAbsent(tagId, k -> new HashMap<>()).put(type, count);
                }
            }
        } catch (Exception ex) {
            log.warn("Failed to load grouped entity tag counts: {}", ex.getMessage());
        }
        return map;
    }

    private Map<String, Long> getPostCountsMap() {
        Map<String, Long> map = new HashMap<>();
        try {
            List<Object[]> rows = tagRepository.countPostsPerTag();
            for (Object[] row : rows) {
                if (row != null && row.length >= 2 && row[0] != null && row[1] != null) {
                    String tagKey = String.valueOf(row[0]).trim().toLowerCase();
                    Long count = ((Number) row[1]).longValue();
                    map.put(tagKey, count);
                }
            }
        } catch (Exception ex) {
            log.warn("Failed to load post tag counts: {}", ex.getMessage());
        }
        return map;
    }

    private Map<String, Long> getMediaCountsMap() {
        Map<String, Long> map = new HashMap<>();
        try {
            List<Object[]> rows = tagRepository.countMediaPerTag();
            for (Object[] row : rows) {
                if (row != null && row.length >= 2 && row[0] != null && row[1] != null) {
                    String tagKey = String.valueOf(row[0]).trim().toLowerCase();
                    Long count = ((Number) row[1]).longValue();
                    map.put(tagKey, count);
                }
            }
        } catch (Exception ex) {
            log.warn("Failed to load media tag counts: {}", ex.getMessage());
        }
        return map;
    }

    private TagResponse mapToResponseWithCounts(
            TagEntity entity,
            Map<Long, Map<String, Long>> groupedCounts,
            Map<String, Long> postCountsFallback,
            Map<String, Long> mediaCountsFallback
    ) {
        if (Objects.isNull(entity)) {
            return null;
        }

        String slug = StringUtils.hasText(entity.getSlug()) ? entity.getSlug().toLowerCase() : AppConstants.EMPTY;
        String name = StringUtils.hasText(entity.getName()) ? entity.getName().toLowerCase() : AppConstants.EMPTY;

        Map<String, Long> entityCounts = groupedCounts.getOrDefault(entity.getId(), Collections.emptyMap());

        long postsCount = entityCounts.getOrDefault(EntityFieldConstants.TYPE_POST, postCountsFallback.getOrDefault(slug, postCountsFallback.getOrDefault(name, 0L)));
        long storesCount = entityCounts.getOrDefault(EntityFieldConstants.TYPE_STORE, 0L);
        long offersCount = entityCounts.getOrDefault(EntityFieldConstants.TYPE_OFFER, 0L);
        long mediaCount = entityCounts.getOrDefault(EntityFieldConstants.TYPE_MEDIA, mediaCountsFallback.getOrDefault(slug, mediaCountsFallback.getOrDefault(name, 0L)));

        return tagMapper.toResponseWithCounts(entity, postsCount, storesCount, offersCount, mediaCount);
    }
}
