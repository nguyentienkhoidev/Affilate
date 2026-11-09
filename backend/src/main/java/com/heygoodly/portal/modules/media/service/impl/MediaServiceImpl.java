package com.heygoodly.portal.modules.media.service.impl;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.constant.EntityFieldConstants;
import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.common.exception.ResourceNotFoundException;
import com.heygoodly.portal.common.util.NullSafeUtils;
import com.heygoodly.portal.modules.audit.dto.request.CreateAuditLogRequest;
import com.heygoodly.portal.modules.audit.service.AuditLogService;
import com.heygoodly.portal.modules.file.service.StorageService;
import com.heygoodly.portal.modules.media.dto.request.MediaQueryCriteria;
import com.heygoodly.portal.modules.media.dto.response.MediaItemResponse;
import com.heygoodly.portal.modules.media.entity.MediaItemEntity;
import com.heygoodly.portal.modules.media.mapper.MediaMapper;
import com.heygoodly.portal.modules.media.repository.MediaItemRepository;
import com.heygoodly.portal.modules.media.service.MediaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaServiceImpl implements MediaService {

    private final MediaItemRepository mediaItemRepository;
    private final StorageService storageService;
    private final AuditLogService auditLogService;
    private final com.heygoodly.portal.modules.tag.service.TagService tagService;
    private final MediaMapper mediaMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MediaItemResponse> getMediaItems(MediaQueryCriteria criteria) {
        log.info("Processing getMediaItems with criteria: page={}, size={}, search={}",
                criteria.getPage(), criteria.getSize(), criteria.getSearch());

        String cleanCategory = NullSafeUtils.safeLowerTrim(criteria.getCategory());
        String cleanSearch = NullSafeUtils.safeTrim(criteria.getSearch());
        String cleanTag = NullSafeUtils.safeLowerTrim(criteria.getTag()).replaceAll("^#+", "");
        String cleanFormat = NullSafeUtils.safeLowerTrim(criteria.getFormat());
        String cleanSort = NullSafeUtils.safeLowerTrim(criteria.getSortBy());

        Sort sort = Sort.by(Sort.Direction.DESC, EntityFieldConstants.CREATED_AT_SNAKE);
        if (EntityFieldConstants.OLDEST.equalsIgnoreCase(cleanSort)) {
            sort = Sort.by(Sort.Direction.ASC, EntityFieldConstants.CREATED_AT_SNAKE);
        } else if (EntityFieldConstants.SIZE_DESC.equalsIgnoreCase(cleanSort)) {
            sort = Sort.by(Sort.Direction.DESC, EntityFieldConstants.SIZE_BYTES);
        } else if (EntityFieldConstants.NAME_ASC.equalsIgnoreCase(cleanSort)) {
            sort = Sort.by(Sort.Direction.ASC, EntityFieldConstants.NAME);
        }

        int pageNum = Math.max(AppConstants.DEFAULT_PAGE_NUMBER, criteria.getPage());
        int pageSize = criteria.getSize() > 0 ? Math.min(criteria.getSize(), AppConstants.MAX_PAGE_SIZE) : AppConstants.DEFAULT_MEDIA_PAGE_SIZE;
        Pageable pageable = PageRequest.of(pageNum, pageSize, sort);

        Page<MediaItemEntity> entityPage = mediaItemRepository.findMediaByFilters(
                cleanCategory.isEmpty() || "all".equalsIgnoreCase(cleanCategory) ? null : cleanCategory,
                cleanSearch.isEmpty() ? null : cleanSearch,
                cleanTag.isEmpty() || "all".equalsIgnoreCase(cleanTag) ? null : cleanTag,
                cleanFormat.isEmpty() || "all".equalsIgnoreCase(cleanFormat) ? null : cleanFormat,
                pageable
        );

        List<MediaItemResponse> responseList = mediaMapper.toSummaryResponseList(entityPage.getContent());

        log.debug("Found {} media items on page {} of {}",
                entityPage.getNumberOfElements(), entityPage.getNumber(), entityPage.getTotalPages());

        return PageResponse.of(
                responseList,
                entityPage.getNumber(),
                entityPage.getSize(),
                entityPage.getTotalElements()
        );
    }

    @Override
    @Transactional
    public MediaItemResponse uploadMedia(MultipartFile file, String category, List<String> tags, String dimensions, Long currentUserId) {
        log.info("Processing media upload for file: {}, category: {}, uploadedBy: {}",
                file.getOriginalFilename(), category, currentUserId);

        String cleanCategory = NullSafeUtils.safeLowerTrim(category);
        if (!StringUtils.hasText(cleanCategory)) {
            cleanCategory = AppConstants.DEFAULT_MEDIA_CATEGORY;
        }

        // 1. Upload file via StorageService (handles compression & storage)
        String fileUrl = storageService.uploadImage(file, cleanCategory);

        String originalName = file.getOriginalFilename();
        if (!StringUtils.hasText(originalName)) {
            StringBuilder nameBuilder = new StringBuilder();
            nameBuilder.append("upload-").append(System.currentTimeMillis()).append(".webp");
            originalName = nameBuilder.toString();
        }

        String objectKey;
        if (StringUtils.hasText(fileUrl) && fileUrl.contains("/heygoodly-media/")) {
            objectKey = fileUrl.substring(fileUrl.indexOf("/heygoodly-media/") + "/heygoodly-media/".length());
        } else {
            StringBuilder keyBuilder = new StringBuilder();
            keyBuilder.append(cleanCategory).append(AppConstants.SLASH)
                    .append(System.currentTimeMillis()).append(AppConstants.HYPHEN)
                    .append(originalName);
            objectKey = keyBuilder.toString();
        }

        long sizeBytes = file.getSize();
        String mimeType = file.getContentType();
        String safeDimensions = NullSafeUtils.safeTrim(dimensions);
        if (!StringUtils.hasText(safeDimensions)) {
            safeDimensions = AppConstants.DEFAULT_DIMENSIONS;
        }

        List<String> safeTags = NullSafeUtils.safeList(tags).stream()
                .map(NullSafeUtils::safeLowerTrim)
                .filter(StringUtils::hasText)
                .distinct()
                .collect(Collectors.toList());

        MediaItemEntity entity = MediaItemEntity.builder()
                .name(originalName)
                .objectKey(objectKey)
                .bucket("heygoodly-media")
                .url(fileUrl)
                .category(cleanCategory)
                .sizeBytes(sizeBytes)
                .mimeType(mimeType)
                .dimensions(safeDimensions)
                .tags(safeTags)
                .uploadedBy(Objects.nonNull(currentUserId) ? currentUserId : 1L)
                .build();

        MediaItemEntity saved = mediaItemRepository.save(entity);

        // Synchronize media tags with centralized taxonomy
        try {
            tagService.syncEntityTags(EntityFieldConstants.TYPE_MEDIA, saved.getId(), safeTags);
        } catch (Exception ex) {
            log.warn("Failed to sync tags for media id: {}: {}", saved.getId(), ex.getMessage());
        }

        try {
            auditLogService.recordLog(CreateAuditLogRequest.builder()
                    .userId(Objects.nonNull(currentUserId) ? currentUserId : 1L)
                    .action("UPLOAD_MEDIA")
                    .module("media")
                    .resourceId(String.valueOf(saved.getId()))
                    .resourceName(saved.getName())
                    .status("SUCCESS")
                    .build());
        } catch (Exception ex) {
            log.warn("Failed to record media upload audit log: {}", ex.getMessage());
        }

        MediaItemResponse response = mediaMapper.toDetailResponse(saved);
        log.info("Successfully uploaded media: id={}, key={}, url={}", saved.getId(), saved.getObjectKey(), saved.getUrl());
        return response;
    }

    @Override
    @Transactional
    public MediaItemResponse updateTags(Long id, List<String> tags) {
        log.info("Updating media tags for id={}", id);
        MediaItemEntity item = mediaItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(String.format("Media item not found with %s: %d", EntityFieldConstants.ID, id)));

        List<String> safeTags = NullSafeUtils.safeList(tags).stream()
                .map(NullSafeUtils::safeLowerTrim)
                .filter(StringUtils::hasText)
                .distinct()
                .collect(Collectors.toList());

        item.setTags(safeTags);
        MediaItemEntity updated = mediaItemRepository.save(item);

        try {
            tagService.syncEntityTags(EntityFieldConstants.TYPE_MEDIA, updated.getId(), safeTags);
        } catch (Exception ex) {
            log.warn("Failed to sync updated tags for media id: {}: {}", updated.getId(), ex.getMessage());
        }

        log.info("Successfully updated tags for media id: {}", id);
        return mediaMapper.toDetailResponse(updated);
    }

    @Transactional
    public MediaItemResponse addTag(Long id, String tag) {
        log.info("Adding tag '{}' to media id={}", tag, id);
        MediaItemEntity item = mediaItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(String.format("Media item not found with %s: %d", EntityFieldConstants.ID, id)));

        String cleanTag = NullSafeUtils.safeLowerTrim(tag).replaceAll("^#+", "");
        if (StringUtils.hasText(cleanTag)) {
            List<String> existingTags = new ArrayList<>(NullSafeUtils.safeList(item.getTags()));
            if (!existingTags.contains(cleanTag)) {
                existingTags.add(cleanTag);
                item.setTags(existingTags);
                item = mediaItemRepository.save(item);

                try {
                    tagService.syncEntityTags(EntityFieldConstants.TYPE_MEDIA, item.getId(), existingTags);
                } catch (Exception ex) {
                    log.warn("Failed to sync tag after add for media id: {}: {}", item.getId(), ex.getMessage());
                }
            }
        }

        return mediaMapper.toDetailResponse(item);
    }

    @Transactional
    public MediaItemResponse removeTag(Long id, String tag) {
        log.info("Removing tag '{}' from media id={}", tag, id);
        MediaItemEntity item = mediaItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(String.format("Media item not found with %s: %d", EntityFieldConstants.ID, id)));

        String cleanTag = NullSafeUtils.safeLowerTrim(tag).replaceAll("^#+", "");
        if (StringUtils.hasText(cleanTag) && !CollectionUtils.isEmpty(item.getTags())) {
            List<String> existingTags = new ArrayList<>(item.getTags());
            existingTags.remove(cleanTag);
            item.setTags(existingTags);
            item = mediaItemRepository.save(item);

            try {
                tagService.syncEntityTags(EntityFieldConstants.TYPE_MEDIA, item.getId(), existingTags);
            } catch (Exception ex) {
                log.warn("Failed to sync tags after remove for media id: {}: {}", item.getId(), ex.getMessage());
            }
        }

        return mediaMapper.toDetailResponse(item);
    }

    @Override
    @Transactional
    public void deleteMedia(Long id) {
        log.info("Deleting media item id={}", id);
        MediaItemEntity item = mediaItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(String.format("Media item not found with %s: %d", EntityFieldConstants.ID, id)));

        // Delete physical file from storage
        try {
            storageService.deleteFile(item.getUrl());
        } catch (Exception ex) {
            log.warn("Failed to delete physical file {}: {}", item.getUrl(), ex.getMessage());
        }

        mediaItemRepository.delete(item);

        try {
            auditLogService.recordLog(CreateAuditLogRequest.builder()
                    .userId(Objects.nonNull(item.getUploadedBy()) ? item.getUploadedBy() : 1L)
                    .action("DELETE_MEDIA")
                    .module("media")
                    .resourceId(String.valueOf(id))
                    .resourceName(item.getName())
                    .status("SUCCESS")
                    .build());
        } catch (Exception ex) {
            log.warn("Failed to record media delete audit log: {}", ex.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllUniqueTags() {
        return mediaItemRepository.findAll().stream()
                .map(MediaItemEntity::getTags)
                .filter(Objects::nonNull)
                .flatMap(List::stream)
                .filter(StringUtils::hasText)
                .map(String::trim)
                .map(String::toLowerCase)
                .distinct()
                .sorted()
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getTagCounts() {
        return mediaItemRepository.findAll().stream()
                .map(MediaItemEntity::getTags)
                .filter(Objects::nonNull)
                .flatMap(List::stream)
                .filter(StringUtils::hasText)
                .map(String::trim)
                .map(String::toLowerCase)
                .collect(Collectors.groupingBy(tag -> tag, TreeMap::new, Collectors.counting()));
    }
}
