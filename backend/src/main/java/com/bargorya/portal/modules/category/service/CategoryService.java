package com.bargorya.portal.modules.category.service;

import com.bargorya.portal.common.dto.PageResponse;
import com.bargorya.portal.modules.category.dto.request.CategoryRequest;
import com.bargorya.portal.modules.category.dto.response.CategoryResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getPublicCategories(String type);
    List<CategoryResponse> getHomeCategories();
    CategoryResponse getCategoryBySlug(String slug);
    PageResponse<CategoryResponse> getAdminCategories(Pageable pageable, String search, String type);
    CategoryResponse getById(Long id);
    CategoryResponse create(CategoryRequest request);
    CategoryResponse update(Long id, CategoryRequest request);
    void delete(Long id);
}
