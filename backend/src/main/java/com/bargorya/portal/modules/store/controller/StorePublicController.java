package com.bargorya.portal.modules.store.controller;

import com.bargorya.portal.common.dto.ApiResponse;
import com.bargorya.portal.common.dto.PageResponse;
import com.bargorya.portal.common.util.PaginationUtils;
import com.bargorya.portal.modules.store.dto.response.StoreDetailResponse;
import com.bargorya.portal.modules.store.dto.response.StoreSummaryResponse;
import com.bargorya.portal.modules.store.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/stores")
@RequiredArgsConstructor
public class StorePublicController {

    private final StoreService storeService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<StoreSummaryResponse>>> getStores(
            @RequestParam(value = "page", required = false, defaultValue = "0") Integer page,
            @RequestParam(value = "size", required = false, defaultValue = "24") Integer size,
            @RequestParam(value = "sortBy", required = false, defaultValue = "sortOrder") String sortBy,
            @RequestParam(value = "direction", required = false, defaultValue = "asc") String direction,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "letter", required = false) String letter
    ) {
        Pageable pageable = PaginationUtils.createPageable(page, size, sortBy, direction);
        PageResponse<StoreSummaryResponse> response = storeService.getPublicStores(pageable, search, letter);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<StoreDetailResponse>> getBySlug(@PathVariable("slug") String slug) {
        StoreDetailResponse response = storeService.getStoreBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
