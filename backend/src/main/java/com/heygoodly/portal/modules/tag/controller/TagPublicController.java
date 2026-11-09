package com.heygoodly.portal.modules.tag.controller;

import com.heygoodly.portal.common.dto.ApiResponse;
import com.heygoodly.portal.modules.tag.dto.TagResponse;
import com.heygoodly.portal.modules.tag.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/public/tags", "/api/v1/tags"})
@RequiredArgsConstructor
public class TagPublicController {

    private final TagService tagService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TagResponse>>> getAllActiveTags() {
        List<TagResponse> tags = tagService.getAllActiveTags();
        return ResponseEntity.ok(ApiResponse.ok(tags));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<TagResponse>>> getFeaturedTags() {
        List<TagResponse> tags = tagService.getFeaturedTags();
        return ResponseEntity.ok(ApiResponse.ok(tags));
    }

    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<String>>> getTrendingTags() {
        List<String> tags = tagService.getTrendingTagNames();
        return ResponseEntity.ok(ApiResponse.ok(tags));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<TagResponse>> getBySlug(@PathVariable("slug") String slug) {
        TagResponse tag = tagService.getTagBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(tag));
    }
}
