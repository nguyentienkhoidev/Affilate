package com.heygoodly.portal.modules.tag.service;

import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.modules.tag.dto.TagRequest;
import com.heygoodly.portal.modules.tag.dto.TagResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TagService {

    PageResponse<TagResponse> getTags(String search, Boolean isFeatured, String entityType, Pageable pageable);

    TagResponse getTagById(Long id);

    TagResponse getTagBySlug(String slug);

    TagResponse createTag(TagRequest request, String currentUsername);

    TagResponse updateTag(Long id, TagRequest request, String currentUsername);

    void deleteTag(Long id, String currentUsername);

    List<TagResponse> getFeaturedTags();

    List<TagResponse> getAllActiveTags();

    List<String> getTrendingTagNames();

    List<String> syncEntityTags(String entityType, Long entityId, List<String> tagNames);

    List<String> getEntityTagNames(String entityType, Long entityId);
}
