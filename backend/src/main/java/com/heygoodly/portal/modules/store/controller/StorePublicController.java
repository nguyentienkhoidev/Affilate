package com.heygoodly.portal.modules.store.controller;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.constant.EntityFieldConstants;
import com.heygoodly.portal.common.dto.ApiResponse;
import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.common.util.PaginationUtils;
import com.heygoodly.portal.modules.store.dto.request.StorePublicQueryCriteria;
import com.heygoodly.portal.modules.store.dto.response.StoreDetailResponse;
import com.heygoodly.portal.modules.store.dto.response.StoreSummaryResponse;
import com.heygoodly.portal.modules.store.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/public/stores", "/api/v1/stores"})
@RequiredArgsConstructor
public class StorePublicController {

    private final StoreService storeService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<StoreSummaryResponse>>> getStores(@ModelAttribute StorePublicQueryCriteria criteria) {
        Pageable pageable = criteria.toPageable();
        String resolvedCategory = String.join(AppConstants.COMMA, criteria.resolvedCategories());
        String resolvedTag = String.join(AppConstants.COMMA, criteria.resolvedTags());
        PageResponse<StoreSummaryResponse> response = storeService.getPublicStores(
                pageable,
                criteria.getSearch(),
                criteria.getLetter(),
                resolvedCategory.isEmpty() ? criteria.getCategory() : resolvedCategory,
                criteria.getFeatured(),
                resolvedTag.isEmpty() ? criteria.getTag() : resolvedTag
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<StoreDetailResponse>> getBySlug(@PathVariable("slug") String slug) {
        StoreDetailResponse response = storeService.getStoreBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
