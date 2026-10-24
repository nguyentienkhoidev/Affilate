package com.bargorya.portal.modules.post.controller;

import com.bargorya.portal.common.dto.ApiResponse;
import com.bargorya.portal.common.dto.PageResponse;
import com.bargorya.portal.common.util.PaginationUtils;
import com.bargorya.portal.modules.post.dto.response.PostDetailResponse;
import com.bargorya.portal.modules.post.dto.response.PostSummaryResponse;
import com.bargorya.portal.modules.post.service.PostService;
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
@RequestMapping("/api/v1/public/posts")
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
            @RequestParam(value = "page", required = false, defaultValue = "0") Integer page,
            @RequestParam(value = "size", required = false, defaultValue = "12") Integer size,
            @RequestParam(value = "sortBy", required = false, defaultValue = "publishedAt") String sortBy,
            @RequestParam(value = "direction", required = false, defaultValue = "desc") String direction,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "search", required = false) String search
    ) {
        Pageable pageable = PaginationUtils.createPageable(page, size, sortBy, direction);
        PageResponse<PostSummaryResponse> response = postService.getPublicPosts(pageable, categoryId, search);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<PostDetailResponse>> getBySlug(@PathVariable("slug") String slug) {
        PostDetailResponse response = postService.getPostBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
