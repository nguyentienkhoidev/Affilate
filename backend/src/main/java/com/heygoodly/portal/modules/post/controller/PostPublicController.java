package com.heygoodly.portal.modules.post.controller;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.constant.EntityFieldConstants;
import com.heygoodly.portal.common.dto.ApiResponse;
import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.common.util.PaginationUtils;
import com.heygoodly.portal.modules.post.dto.request.PostPublicQueryCriteria;
import com.heygoodly.portal.modules.post.dto.response.PostDetailResponse;
import com.heygoodly.portal.modules.post.dto.response.PostSummaryResponse;
import com.heygoodly.portal.modules.post.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/public/posts", "/api/v1/posts"})
@RequiredArgsConstructor
public class PostPublicController {

    private final PostService postService;

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<PostSummaryResponse>>> getFeatured() {
        List<PostSummaryResponse> featured = postService.getHomeFeatured();
        return ResponseEntity.ok(ApiResponse.ok(featured));
    }

    @GetMapping("/editor-picks")
    public ResponseEntity<ApiResponse<List<PostSummaryResponse>>> getEditorPicks() {
        List<PostSummaryResponse> picks = postService.getEditorPicks();
        return ResponseEntity.ok(ApiResponse.ok(picks));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PostSummaryResponse>>> list(
            @RequestParam(value = "page", required = false, defaultValue = AppConstants.DEFAULT_PAGE_NUMBER_STR) Integer page,
            @RequestParam(value = "size", required = false, defaultValue = "12") Integer size,
            @RequestParam(value = "sortBy", required = false, defaultValue = EntityFieldConstants.PUBLISHED_AT) String sortBy,
            @RequestParam(value = "direction", required = false, defaultValue = AppConstants.DEFAULT_SORT_DIRECTION_DESC) String direction,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "categoryIds", required = false) List<Long> categoryIds,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "categorySlug", required = false) String categorySlug,
            @RequestParam(value = "categories", required = false) List<String> categories,
            @RequestParam(value = "categorySlugs", required = false) List<String> categorySlugs,
            @RequestParam(value = "storeSlug", required = false) String storeSlug,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "tag", required = false) String tag,
            @RequestParam(value = "tags", required = false) List<String> tags,
            @RequestParam(value = "featured", required = false) Boolean featured
    ) {
        Pageable pageable = PaginationUtils.createPageable(page, size, sortBy, direction);
        PostPublicQueryCriteria criteria = PostPublicQueryCriteria.builder()
                .pageable(pageable)
                .categoryId(categoryId)
                .categoryIds(categoryIds)
                .category(category)
                .categorySlug(categorySlug)
                .categories(categories)
                .categorySlugs(categorySlugs)
                .storeSlug(storeSlug)
                .search(search)
                .tag(tag)
                .tags(tags)
                .featured(featured)
                .build();
        PageResponse<PostSummaryResponse> response = postService.getPublicPosts(criteria);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<PostDetailResponse>> getBySlug(@PathVariable("slug") String slug) {
        PostDetailResponse response = postService.getPostBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
