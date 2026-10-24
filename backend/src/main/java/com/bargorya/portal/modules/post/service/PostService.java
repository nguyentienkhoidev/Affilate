package com.bargorya.portal.modules.post.service;

import com.bargorya.portal.common.dto.PageResponse;
import com.bargorya.portal.modules.post.dto.request.PostRequest;
import com.bargorya.portal.modules.post.dto.response.PostDetailResponse;
import com.bargorya.portal.modules.post.dto.response.PostSummaryResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PostService {
    List<PostSummaryResponse> getHomeFeatured();
    List<PostSummaryResponse> getEditorPicks();
    PageResponse<PostSummaryResponse> getPublicPosts(Pageable pageable, Long categoryId, String search);
    PostDetailResponse getPostBySlug(String slug);
    PageResponse<PostSummaryResponse> getAdminPosts(Pageable pageable, Long categoryId, String search, Boolean active);
    PostDetailResponse getById(Long id);
    PostDetailResponse create(PostRequest request);
    PostDetailResponse update(Long id, PostRequest request);
    PostDetailResponse clonePost(Long id);
    void delete(Long id);
}
