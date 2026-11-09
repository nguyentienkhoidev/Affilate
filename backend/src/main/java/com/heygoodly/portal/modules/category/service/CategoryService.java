package com.heygoodly.portal.modules.category.service;

import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.modules.category.dto.request.CategoryRequest;
import com.heygoodly.portal.modules.category.dto.response.CategoryResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getPublicCategories(String type);
    PageResponse<CategoryResponse> getPublicCategories(Pageable pageable, String type, String search);
    List<CategoryResponse> getHomeCategories();
    CategoryResponse getCategoryBySlug(String slug);
    PageResponse<CategoryResponse> getAdminCategories(Pageable pageable, String search, String type);
    CategoryResponse getById(Long id);
    CategoryResponse create(CategoryRequest request);
    CategoryResponse update(Long id, CategoryRequest request);
    void delete(Long id);
}
