package com.heygoodly.portal.modules.media.mapper;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.mapper.BaseMapper;
import com.heygoodly.portal.modules.media.dto.response.MediaItemResponse;
import com.heygoodly.portal.modules.media.entity.MediaItemEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Dedicated mapper component for Media assets.
 * Utilizes Stream API, null-safe utility methods, and method references.
 */
@Slf4j
@Component
public class MediaMapper implements BaseMapper<MediaItemEntity, MediaItemResponse, MediaItemResponse> {

    @Override
    public MediaItemResponse toDetailResponse(MediaItemEntity entity) {
        if (Objects.isNull(entity)) {
            return null;
        }

        String format = extractFormat(entity.getName(), entity.getMimeType());
        String sizeFormatted = formatSize(entity.getSizeBytes());
        List<String> tagList = CollectionUtils.isEmpty(entity.getTags())
                ? Collections.emptyList()
                : new ArrayList<>(entity.getTags());

        return MediaItemResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .objectKey(entity.getObjectKey())
                .bucket(entity.getBucket())
                .url(entity.getUrl())
                .category(entity.getCategory())
                .sizeBytes(entity.getSizeBytes())
                .size(sizeFormatted)
                .mimeType(entity.getMimeType())
                .dimensions(StringUtils.hasText(entity.getDimensions()) ? entity.getDimensions() : AppConstants.DEFAULT_DIMENSIONS)
                .format(format)
                .tags(tagList)
                .uploadedBy(entity.getUploadedBy())
                .createdAt(Objects.nonNull(entity.getCreatedAt()) ? entity.getCreatedAt().toString() : Instant.now().toString())
                .build();
    }

    @Override
    public MediaItemResponse toSummaryResponse(MediaItemEntity entity) {
        return toDetailResponse(entity);
    }

    public String extractFormat(String name, String mimeType) {
        if (StringUtils.hasText(name) && name.contains(AppConstants.DOT)) {
            return name.substring(name.lastIndexOf(AppConstants.DOT) + 1).toUpperCase();
        }
        if (StringUtils.hasText(mimeType) && mimeType.contains(AppConstants.SLASH)) {
            return mimeType.substring(mimeType.lastIndexOf(AppConstants.SLASH) + 1).toUpperCase();
        }
        return AppConstants.DEFAULT_IMAGE_FORMAT;
    }

    public String formatSize(Long bytes) {
        if (Objects.isNull(bytes) || bytes <= 0) {
            return "0 KB";
        }
        if (bytes < 1024) {
            StringBuilder sb = new StringBuilder();
            sb.append(bytes).append(AppConstants.SPACE).append("B");
            return sb.toString();
        }
        long kb = Math.round((double) bytes / 1024.0);
        if (kb < 1024) {
            StringBuilder sb = new StringBuilder();
            sb.append(kb).append(AppConstants.SPACE).append("KB");
            return sb.toString();
        }
        double mb = (double) bytes / (1024.0 * 1024.0);
        return String.format("%.1f MB", mb);
    }
}

