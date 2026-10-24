package com.bargorya.portal.modules.category.controller;

import com.bargorya.portal.common.dto.ApiResponse;
import com.bargorya.portal.modules.category.dto.response.CategoryResponse;
import com.bargorya.portal.modules.category.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/categories")
@RequiredArgsConstructor
public class CategoryPublicController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories(
            @RequestParam(value = "type", required = false, defaultValue = "post") String type
    ) {
        List<CategoryResponse> categories = categoryService.getPublicCategories(type);
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
