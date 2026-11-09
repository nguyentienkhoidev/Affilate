package com.heygoodly.portal.modules.store.service;

import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.modules.store.dto.request.StoreRequest;
import com.heygoodly.portal.modules.store.dto.response.StoreDetailResponse;
import com.heygoodly.portal.modules.store.dto.response.StoreSummaryResponse;
import org.springframework.data.domain.Pageable;

public interface StoreService {
    PageResponse<StoreSummaryResponse> getPublicStores(Pageable pageable, String search, String letter, String category, Boolean featured, String tag);
    default PageResponse<StoreSummaryResponse> getPublicStores(Pageable pageable, String search, String letter, String category, Boolean featured) {
        return getPublicStores(pageable, search, letter, category, featured, null);
    }
    StoreDetailResponse getStoreBySlug(String slug);
    Long resolveCategoryId(String category);
    PageResponse<StoreSummaryResponse> getAdminStores(Pageable pageable, String search, String status, Long categoryId, String tag);
    default PageResponse<StoreSummaryResponse> getAdminStores(Pageable pageable, String search, String status, Long categoryId) {
        return getAdminStores(pageable, search, status, categoryId, null);
    }
    StoreDetailResponse getById(Long id);
    StoreDetailResponse getByIdOrSlug(String idOrSlug);
    StoreDetailResponse create(StoreRequest request);
    StoreDetailResponse update(Long id, StoreRequest request);
    StoreDetailResponse updateByIdOrSlug(String idOrSlug, StoreRequest request);
    StoreSummaryResponse toggleStatus(Long id);
    StoreSummaryResponse toggleStatusByIdOrSlug(String idOrSlug);
    StoreDetailResponse cloneStore(Long id);
    StoreDetailResponse cloneStoreByIdOrSlug(String idOrSlug);
    void delete(Long id);
    void deleteByIdOrSlug(String idOrSlug);
}
