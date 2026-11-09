package com.heygoodly.portal.modules.post.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.mapper.BaseMapper;
import com.heygoodly.portal.common.util.NullSafeUtils;
import com.heygoodly.portal.modules.category.entity.CategoryEntity;
import com.heygoodly.portal.modules.post.constant.PostConstants;
import com.heygoodly.portal.modules.post.dto.response.PostDetailResponse;
import com.heygoodly.portal.modules.post.dto.response.PostSummaryResponse;
import com.heygoodly.portal.modules.post.entity.PostEntity;
import com.heygoodly.portal.modules.post.constant.PostStatus;
import com.heygoodly.portal.modules.store.entity.StoreEntity;
import com.heygoodly.portal.modules.user.entity.UserEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/**
 * Dedicated mapper for Post/Article editorial entities.
 * Implements BaseMapper and utilizes Stream API, lambda expressions, and method references.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PostMapper implements BaseMapper<PostEntity, PostDetailResponse, PostSummaryResponse> {

    private final ObjectMapper objectMapper;

    @Override
    public PostDetailResponse toDetailResponse(PostEntity p) {
        return toDetailResponse(p, null, null, null);
    }

    @Override
    public PostSummaryResponse toSummaryResponse(PostEntity p) {
        return toSummaryResponse(p, null, null, null, false);
    }

    public PostDetailResponse toDetailResponse(
            PostEntity p,
            CategoryEntity cat,
            UserEntity author,
            StoreEntity store
    ) {
        if (Objects.isNull(p)) {
            return null;
        }

        String authorName = (Objects.nonNull(author) && StringUtils.hasText(author.getFullName()))
                ? author.getFullName()
                : PostConstants.DEFAULT_AUTHOR_NAME;
        String authorAvatar = Objects.nonNull(author) ? NullSafeUtils.trimToNull(author.getAvatar()) : null;
        String authorRole = (Objects.nonNull(author) && StringUtils.hasText(author.getDepartment()))
                ? author.getDepartment()
                : PostConstants.DEFAULT_AUTHOR_ROLE;
        String authorBio = Objects.nonNull(author) ? NullSafeUtils.trimToNull(author.getBio()) : null;

        String readTime = StringUtils.hasText(p.getReadTime())
                ? p.getReadTime().trim()
                : estimateReadTime(p.getContent());

        List<String> resolvedTags = extractTags(p.getTags(), p.getMetaKeywords());
        Map<String, Object> sidebarConfig = parseSidebarJson(p.getSidebarConfig());

        return new PostDetailResponse(
                p.getId(),
                p.getTitle(),
                p.getSlug(),
                p.getImage(),
                p.getExcerpt(),
                p.getContent(),
                Objects.nonNull(cat) ? cat.getId() : p.getCategoryId(),
                Objects.nonNull(cat) ? cat.getName() : null,
                Objects.nonNull(cat) ? cat.getSlug() : null,
                Objects.nonNull(store) ? store.getId() : p.getStoreId(),
                Objects.nonNull(store) ? store.getSlug() : null,
                Objects.nonNull(store) ? store.getName() : null,
                authorName,
                authorAvatar,
                authorRole,
                authorBio,
                readTime,
                p.getRating(),
                resolvedTags,
                sidebarConfig,
                NullSafeUtils.safeBoolean(p.getIsFeatured()),
                NullSafeUtils.safeBoolean(p.getIsActive()),
                p.getPublishedAt(),
                NullSafeUtils.safeLong(p.getViewCount(), 0L),
                p.getMetaTitle(),
                p.getMetaKeywords(),
                p.getMetaDescription(),
                p.getCanonicalUrl(),
                computeStatus(p)
        );
    }

    public PostSummaryResponse toSummaryResponse(
            PostEntity p,
            CategoryEntity cat,
            UserEntity author,
            StoreEntity store,
            boolean publicOnly
    ) {
        if (Objects.isNull(p)) {
            return null;
        }

        String authorName = (Objects.nonNull(author) && StringUtils.hasText(author.getFullName()))
                ? author.getFullName()
                : PostConstants.DEFAULT_AUTHOR_NAME;
        String authorAvatar = Objects.nonNull(author) ? NullSafeUtils.trimToNull(author.getAvatar()) : null;
        String authorRole = (Objects.nonNull(author) && StringUtils.hasText(author.getDepartment()))
                ? author.getDepartment()
                : PostConstants.DEFAULT_AUTHOR_ROLE;

        String readTime = StringUtils.hasText(p.getReadTime())
                ? p.getReadTime().trim()
                : estimateReadTime(p.getContent());

        List<String> resolvedTags = extractTags(p.getTags(), p.getMetaKeywords());

        return new PostSummaryResponse(
                p.getId(),
                p.getTitle(),
                p.getSlug(),
                p.getImage(),
                p.getExcerpt(),
                Objects.nonNull(cat) ? cat.getId() : p.getCategoryId(),
                Objects.nonNull(cat) ? cat.getName() : null,
                Objects.nonNull(cat) ? cat.getSlug() : null,
                Objects.nonNull(store) ? store.getId() : (publicOnly ? null : p.getStoreId()),
                Objects.nonNull(store) ? store.getSlug() : null,
                Objects.nonNull(store) ? store.getName() : null,
                authorName,
                authorAvatar,
                authorRole,
                readTime,
                p.getRating(),
                resolvedTags,
                NullSafeUtils.safeBoolean(p.getIsFeatured()),
                NullSafeUtils.safeBoolean(p.getIsActive()),
                p.getPublishedAt(),
                NullSafeUtils.safeLong(p.getViewCount(), 0L),
                computeStatus(p)
        );
    }

    public String computeStatus(PostEntity p) {
        if (!NullSafeUtils.safeBoolean(p.getIsActive())) {
            return PostStatus.DRAFT.name();
        }
        Instant now = Instant.now();
        if (Objects.nonNull(p.getPublishedAt()) && p.getPublishedAt().isAfter(now)) {
            return PostStatus.SCHEDULED.name();
        }
        return PostStatus.PUBLISHED.name();
    }

    public String estimateReadTime(String content) {
        if (!StringUtils.hasText(content)) {
            return PostConstants.DEFAULT_READ_TIME;
        }
        int wordCount = content.trim().split("\\s+").length;
        int minutes = Math.max(1, (int) Math.ceil((double) wordCount / 200.0));
        StringBuilder sb = new StringBuilder();
        sb.append(minutes).append(AppConstants.SPACE).append("min read");
        return sb.toString();
    }

    public List<String> extractTags(String tagsJson, String metaKeywords) {
        Set<String> result = new LinkedHashSet<>();
        if (StringUtils.hasText(tagsJson)) {
            try {
                List<String> list = objectMapper.readValue(tagsJson, new TypeReference<List<String>>() {});
                if (Objects.nonNull(list)) {
                    list.stream().filter(StringUtils::hasText).map(String::trim).forEach(result::add);
                }
            } catch (Exception ignored) {
                // Ignore parsing errors
            }
        }
        if (result.isEmpty() && StringUtils.hasText(metaKeywords)) {
            for (String part : metaKeywords.split(AppConstants.COMMA)) {
                String trimmed = part.trim();
                if (StringUtils.hasText(trimmed)) {
                    result.add(trimmed);
                }
            }
        }
        return new ArrayList<>(result);
    }

    public Map<String, Object> parseSidebarJson(String json) {
        if (!StringUtils.hasText(json)) {
            return Collections.emptyMap();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse sidebar config json: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }
}
