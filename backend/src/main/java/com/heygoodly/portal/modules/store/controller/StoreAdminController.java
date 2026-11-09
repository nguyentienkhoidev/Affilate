package com.heygoodly.portal.modules.store.controller;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.constant.EntityFieldConstants;
import com.heygoodly.portal.common.constant.MessageConstants;
import com.heygoodly.portal.common.constant.PermissionConstants;
import com.heygoodly.portal.common.dto.ApiResponse;
import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.common.util.PaginationUtils;
import com.heygoodly.portal.modules.role.enums.RoleCode;
import com.heygoodly.portal.modules.store.dto.request.StoreAdminQueryCriteria;
import com.heygoodly.portal.modules.store.dto.request.StoreRequest;
import com.heygoodly.portal.modules.store.dto.response.StoreDetailResponse;
import com.heygoodly.portal.modules.store.dto.response.StoreSummaryResponse;
import com.heygoodly.portal.modules.store.service.StoreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Objects;

@RestController
@RequestMapping("/api/v1/admin/stores")
@RequiredArgsConstructor
public class StoreAdminController {

    private final StoreService storeService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<StoreSummaryResponse>>> list(@ModelAttribute StoreAdminQueryCriteria criteria) {
        Long targetCatId = criteria.getCategoryId();
        if (Objects.isNull(targetCatId) && StringUtils.hasText(criteria.getCategory()) && !criteria.getCategory().equalsIgnoreCase(AppConstants.ALL)) {
            targetCatId = storeService.resolveCategoryId(criteria.getCategory());
        }
        Pageable pageable = criteria.toPageable();
        PageResponse<StoreSummaryResponse> response = storeService.getAdminStores(pageable, criteria.getSearch(), criteria.getStatus(), targetCatId, criteria.getTag());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<StoreDetailResponse>> getById(@PathVariable("id") String id) {
        StoreDetailResponse response = storeService.getByIdOrSlug(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.STORE_CREATE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<StoreDetailResponse>> create(@Valid @RequestBody StoreRequest request) {
        StoreDetailResponse response = storeService.create(request);
        return ResponseEntity.ok(ApiResponse.created(MessageConstants.CREATED, response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.STORE_UPDATE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<StoreDetailResponse>> update(
            @PathVariable("id") String id,
            @Valid @RequestBody StoreRequest request
    ) {
        StoreDetailResponse response = storeService.updateByIdOrSlug(id, request);
        return ResponseEntity.ok(ApiResponse.ok(MessageConstants.UPDATED, response));
    }

    @RequestMapping(value = "/{id}/toggle-status", method = {RequestMethod.PATCH, RequestMethod.PUT})
    @PreAuthorize("hasAuthority('" + PermissionConstants.STORE_UPDATE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<StoreSummaryResponse>> toggleStatus(@PathVariable("id") String id) {
        StoreSummaryResponse response = storeService.toggleStatusByIdOrSlug(id);
        return ResponseEntity.ok(ApiResponse.ok(MessageConstants.UPDATED, response));
    }

    @PostMapping("/{id}/clone")
    @PreAuthorize("hasAuthority('" + PermissionConstants.STORE_CREATE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<StoreDetailResponse>> cloneStore(@PathVariable("id") String id) {
        StoreDetailResponse response = storeService.cloneStoreByIdOrSlug(id);
        return ResponseEntity.ok(ApiResponse.created(MessageConstants.CREATED, response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.STORE_DELETE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable("id") String id) {
        storeService.deleteByIdOrSlug(id);
        return ResponseEntity.ok(ApiResponse.ok(MessageConstants.DELETED, null));
    }
}
