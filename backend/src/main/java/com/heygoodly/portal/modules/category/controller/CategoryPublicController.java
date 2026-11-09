package com.heygoodly.portal.modules.category.controller;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.constant.EntityFieldConstants;
import com.heygoodly.portal.common.dto.ApiResponse;
import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.common.util.PaginationUtils;
import com.heygoodly.portal.modules.category.dto.response.CategoryResponse;
import com.heygoodly.portal.modules.category.service.CategoryService;
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
@RequestMapping({"/api/v1/public/categories", "/api/v1/categories"})
@RequiredArgsConstructor
public class CategoryPublicController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CategoryResponse>>> getCategories(
            @RequestParam(value = "page", required = false, defaultValue = AppConstants.DEFAULT_PAGE_NUMBER_STR) Integer page,
            @RequestParam(value = "size", required = false, defaultValue = AppConstants.DEFAULT_PUBLIC_PAGE_SIZE_STR) Integer size,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "type", required = false, defaultValue = "post") String type
    ) {
        Pageable pageable = PaginationUtils.createPageable(page, size, EntityFieldConstants.SORT_ORDER, AppConstants.DEFAULT_SORT_DIRECTION_ASC);
        PageResponse<CategoryResponse> categories = categoryService.getPublicCategories(pageable, type, search);
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }

    @GetMapping("/home")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getHomeCategories() {
        List<CategoryResponse> categories = categoryService.getHomeCategories();
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getBySlug(@PathVariable("slug") String slug) {
        CategoryResponse category = categoryService.getCategoryBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(category));
    }
}
