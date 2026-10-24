package com.bargorya.portal.modules.store.controller;

import com.bargorya.portal.common.constant.MessageConstants;
import com.bargorya.portal.common.constant.PermissionConstants;
import com.bargorya.portal.common.dto.ApiResponse;
import com.bargorya.portal.common.dto.PageResponse;
import com.bargorya.portal.common.util.PaginationUtils;
import com.bargorya.portal.modules.store.dto.request.StoreRequest;
import com.bargorya.portal.modules.store.dto.response.StoreDetailResponse;
import com.bargorya.portal.modules.store.dto.response.StoreSummaryResponse;
import com.bargorya.portal.modules.store.service.StoreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/stores")
@RequiredArgsConstructor
public class StoreAdminController {

    private final StoreService storeService;

    @GetMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.STORE_VIEW + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<StoreSummaryResponse>>> list(
            @RequestParam(value = "page", required = false, defaultValue = "0") Integer page,
            @RequestParam(value = "size", required = false, defaultValue = "20") Integer size,
            @RequestParam(value = "sortBy", required = false, defaultValue = "id") String sortBy,
            @RequestParam(value = "direction", required = false, defaultValue = "desc") String direction,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "network", required = false) String network,
            @RequestParam(value = "status", required = false) String status
    ) {
        Pageable pageable = PaginationUtils.createPageable(page, size, sortBy, direction);
        PageResponse<StoreSummaryResponse> response = storeService.getAdminStores(pageable, search, network, status);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.STORE_VIEW + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<StoreDetailResponse>> getById(@PathVariable("id") Long id) {
        StoreDetailResponse response = storeService.getById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.STORE_CREATE + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<StoreDetailResponse>> create(@Valid @RequestBody StoreRequest request) {
        StoreDetailResponse response = storeService.create(request);
        return ResponseEntity.ok(ApiResponse.created(MessageConstants.CREATED, response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.STORE_UPDATE + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<StoreDetailResponse>> update(
            @PathVariable("id") Long id,
            @Valid @RequestBody StoreRequest request
    ) {
        StoreDetailResponse response = storeService.update(id, request);
        return ResponseEntity.ok(ApiResponse.ok(MessageConstants.UPDATED, response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.STORE_DELETE + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable("id") Long id) {
        storeService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(MessageConstants.DELETED, null));
    }
}
