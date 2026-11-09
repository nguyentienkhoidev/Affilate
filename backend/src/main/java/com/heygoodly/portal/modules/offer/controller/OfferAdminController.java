package com.heygoodly.portal.modules.offer.controller;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.constant.EntityFieldConstants;
import com.heygoodly.portal.common.constant.MessageConstants;
import com.heygoodly.portal.common.constant.PermissionConstants;
import com.heygoodly.portal.common.dto.ApiResponse;
import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.common.util.PaginationUtils;
import com.heygoodly.portal.modules.offer.dto.request.OfferAdminQueryCriteria;
import com.heygoodly.portal.modules.offer.dto.request.OfferRequest;
import com.heygoodly.portal.modules.offer.dto.response.OfferResponse;
import com.heygoodly.portal.modules.offer.service.OfferService;
import com.heygoodly.portal.modules.role.enums.RoleCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/offers")
@RequiredArgsConstructor
public class OfferAdminController {

    private final OfferService offerService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<OfferResponse>>> list(@ModelAttribute OfferAdminQueryCriteria criteria) {
        Pageable pageable = criteria.toPageable();
        PageResponse<OfferResponse> response = offerService.getAdminOffers(pageable, criteria.getStoreId(), criteria.getSearch(), criteria.getType(), criteria.getVerified());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OfferResponse>> getById(@PathVariable("id") Long id) {
        OfferResponse response = offerService.getById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.OFFER_CREATE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<OfferResponse>> create(@Valid @RequestBody OfferRequest request) {
        OfferResponse response = offerService.create(request);
        return ResponseEntity.ok(ApiResponse.created(MessageConstants.CREATED, response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.OFFER_UPDATE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<OfferResponse>> update(
            @PathVariable("id") Long id,
            @Valid @RequestBody OfferRequest request
    ) {
        OfferResponse response = offerService.update(id, request);
        return ResponseEntity.ok(ApiResponse.ok(MessageConstants.UPDATED, response));
    }

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasAuthority('" + PermissionConstants.OFFER_VERIFY + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<OfferResponse>> toggleVerify(@PathVariable("id") Long id) {
        OfferResponse response = offerService.toggleVerify(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasAuthority('" + PermissionConstants.OFFER_VERIFY + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<OfferResponse>> toggleVerifyPatch(@PathVariable("id") Long id) {
        OfferResponse response = offerService.toggleVerify(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasAuthority('" + PermissionConstants.OFFER_UPDATE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<OfferResponse>> toggleStatus(@PathVariable("id") Long id) {
        OfferResponse response = offerService.toggleStatus(id);
        return ResponseEntity.ok(ApiResponse.ok(MessageConstants.UPDATED, response));
    }

    @PutMapping("/{id}/toggle-status")
    @PreAuthorize("hasAuthority('" + PermissionConstants.OFFER_UPDATE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<OfferResponse>> toggleStatusPut(@PathVariable("id") Long id) {
        OfferResponse response = offerService.toggleStatus(id);
        return ResponseEntity.ok(ApiResponse.ok(MessageConstants.UPDATED, response));
    }

    @PostMapping("/{id}/clone")
    @PreAuthorize("hasAuthority('" + PermissionConstants.OFFER_CLONE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<OfferResponse>> cloneOffer(@PathVariable("id") Long id) {
        OfferResponse response = offerService.cloneOffer(id);
        return ResponseEntity.ok(ApiResponse.created("Offer cloned successfully.", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.OFFER_DELETE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable("id") Long id) {
        offerService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(MessageConstants.DELETED, null));
    }
}
