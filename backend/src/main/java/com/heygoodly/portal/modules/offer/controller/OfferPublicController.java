package com.heygoodly.portal.modules.offer.controller;

import com.heygoodly.portal.common.dto.ApiResponse;
import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.common.util.PaginationUtils;
import com.heygoodly.portal.modules.offer.dto.response.OfferResponse;
import com.heygoodly.portal.modules.offer.service.OfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class OfferPublicController {

    private final OfferService offerService;

    @GetMapping({"/api/v1/public/stores/{slug}/offers", "/api/v1/stores/{slug}/offers"})
    public ResponseEntity<ApiResponse<List<OfferResponse>>> getOffers(@PathVariable("slug") String slug) {
        List<OfferResponse> offers = offerService.getPublicOffersByStore(slug);
        return ResponseEntity.ok(ApiResponse.ok(offers));
    }

    @GetMapping({"/api/v1/public/offers", "/api/v1/offers", "/api/v1/public/deals", "/api/v1/deals", "/api/v1/public/coupons", "/api/v1/coupons"})
    public ResponseEntity<ApiResponse<PageResponse<OfferResponse>>> listPublicOffers(
            @RequestParam(value = "page", required = false, defaultValue = "0") Integer page,
            @RequestParam(value = "size", required = false, defaultValue = "24") Integer size,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "sortBy", required = false, defaultValue = "sortOrder") String sortBy,
            @RequestParam(value = "direction", required = false, defaultValue = "asc") String direction
    ) {
        Pageable pageable = PaginationUtils.createPageable(page, size, sortBy, direction);
        PageResponse<OfferResponse> response = offerService.searchPublicOffers(pageable, search);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping({"/api/v1/public/offers/{id}", "/api/v1/offers/{id}"})
    public ResponseEntity<ApiResponse<OfferResponse>> getOfferById(@PathVariable("id") Long id) {
        OfferResponse response = offerService.getPublicOfferById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
