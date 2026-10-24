package com.bargorya.portal.modules.offer.controller;

import com.bargorya.portal.common.constant.MessageConstants;
import com.bargorya.portal.common.constant.PermissionConstants;
import com.bargorya.portal.common.dto.ApiResponse;
import com.bargorya.portal.common.dto.PageResponse;
import com.bargorya.portal.common.util.PaginationUtils;
import com.bargorya.portal.modules.offer.dto.request.OfferRequest;
import com.bargorya.portal.modules.offer.dto.response.OfferResponse;
import com.bargorya.portal.modules.offer.service.OfferService;
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
@RequestMapping("/api/v1/admin/offers")
@RequiredArgsConstructor
public class OfferAdminController {

    private final OfferService offerService;

    @GetMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.OFFER_VIEW + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<OfferResponse>>> list(
            @RequestParam(value = "page", required = false, defaultValue = "0") Integer page,
            @RequestParam(value = "size", required = false, defaultValue = "20") Integer size,
            @RequestParam(value = "sortBy", required = false, defaultValue = "id") String sortBy,
            @RequestParam(value = "direction", required = false, defaultValue = "desc") String direction,
            @RequestParam(value = "storeId", required = false) Long storeId,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "verified", required = false) Boolean verified
    ) {
        Pageable pageable = PaginationUtils.createPageable(page, size, sortBy, direction);
        PageResponse<OfferResponse> response = offerService.getAdminOffers(pageable, storeId, search, verified);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.OFFER_VIEW + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<OfferResponse>> getById(@PathVariable("id") Long id) {
        OfferResponse response = offerService.getById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.OFFER_CREATE + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<OfferResponse>> create(@Valid @RequestBody OfferRequest request) {
        OfferResponse response = offerService.create(request);
        return ResponseEntity.ok(ApiResponse.created(MessageConstants.CREATED, response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.OFFER_UPDATE + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<OfferResponse>> update(
            @PathVariable("id") Long id,
            @Valid @RequestBody OfferRequest request
    ) {
        OfferResponse response = offerService.update(id, request);
        return ResponseEntity.ok(ApiResponse.ok(MessageConstants.UPDATED, response));
    }

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasAuthority('" + PermissionConstants.OFFER_VERIFY + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<OfferResponse>> toggleVerify(@PathVariable("id") Long id) {
        OfferResponse response = offerService.toggleVerify(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/{id}/clone")
    @PreAuthorize("hasAuthority('" + PermissionConstants.OFFER_CLONE + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<OfferResponse>> cloneOffer(@PathVariable("id") Long id) {
        OfferResponse response = offerService.cloneOffer(id);
        return ResponseEntity.ok(ApiResponse.created("Offer cloned successfully.", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.OFFER_DELETE + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable("id") Long id) {
        offerService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(MessageConstants.DELETED, null));
    }
}
