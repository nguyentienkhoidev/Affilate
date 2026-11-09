package com.heygoodly.portal.modules.media.service;

import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.modules.media.dto.request.MediaQueryCriteria;
import com.heygoodly.portal.modules.media.dto.response.MediaItemResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface MediaService {

    PageResponse<MediaItemResponse> getMediaItems(MediaQueryCriteria criteria);

    MediaItemResponse uploadMedia(MultipartFile file, String category, List<String> tags, String dimensions, Long currentUserId);

    MediaItemResponse updateTags(Long id, List<String> tags);

    void deleteMedia(Long id);

    List<String> getAllUniqueTags();

    Map<String, Long> getTagCounts();
}

