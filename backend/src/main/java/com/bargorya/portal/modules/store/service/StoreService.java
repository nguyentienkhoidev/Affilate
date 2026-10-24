package com.bargorya.portal.modules.store.service;

import com.bargorya.portal.common.dto.PageResponse;
import com.bargorya.portal.modules.store.dto.request.StoreRequest;
import com.bargorya.portal.modules.store.dto.response.StoreDetailResponse;
import com.bargorya.portal.modules.store.dto.response.StoreSummaryResponse;
import org.springframework.data.domain.Pageable;

public interface StoreService {
    PageResponse<StoreSummaryResponse> getPublicStores(Pageable pageable, String search, String letter);
    StoreDetailResponse getStoreBySlug(String slug);
    PageResponse<StoreSummaryResponse> getAdminStores(Pageable pageable, String search, String network, String status);
    StoreDetailResponse getById(Long id);
    StoreDetailResponse create(StoreRequest request);
    StoreDetailResponse update(Long id, StoreRequest request);
    void delete(Long id);
}
