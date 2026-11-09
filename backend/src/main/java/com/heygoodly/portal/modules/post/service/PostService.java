package com.heygoodly.portal.modules.post.service;

import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.modules.post.dto.request.PostAdminQueryCriteria;
import com.heygoodly.portal.modules.post.dto.request.PostPublicQueryCriteria;
import com.heygoodly.portal.modules.post.dto.request.PostRequest;
import com.heygoodly.portal.modules.post.dto.response.PostDetailResponse;
import com.heygoodly.portal.modules.post.dto.response.PostStatsResponse;
import com.heygoodly.portal.modules.post.dto.response.PostSummaryResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PostService {
    List<String> getTrendingTags();
    List<PostSummaryResponse> getHomeFeatured();
    List<PostSummaryResponse> getEditorPicks();

    PageResponse<PostSummaryResponse> getPublicPosts(PostPublicQueryCriteria criteria);

    default PageResponse<PostSummaryResponse> getPublicPosts(Pageable pageable, Long categoryId, String search, String tag) {
        return getPublicPosts(PostPublicQueryCriteria.builder()
                .pageable(pageable)
                .categoryId(categoryId)
                .search(search)
                .tag(tag)
                .build());
    }

    default PageResponse<PostSummaryResponse> getPublicPosts(Pageable pageable, Long categoryId, String search) {
        return getPublicPosts(pageable, categoryId, search, null);
    }

    PostDetailResponse getPostBySlug(String slug);

    PageResponse<PostSummaryResponse> getAdminPosts(PostAdminQueryCriteria criteria);

    default PageResponse<PostSummaryResponse> getAdminPosts(Pageable pageable, Long categoryId, String search, String status, Boolean active, String tag, Boolean featured) {
        return getAdminPosts(PostAdminQueryCriteria.builder()
                .pageable(pageable)
                .categoryId(categoryId)
                .search(search)
                .status(status)
                .active(active)
                .tag(tag)
                .featured(featured)
                .build());
    }

    PostStatsResponse getPostStats();
    PostDetailResponse getById(Long id);
    PostDetailResponse create(PostRequest request);
    PostDetailResponse update(Long id, PostRequest request);
    PostDetailResponse clonePost(Long id);
    void delete(Long id);
}
