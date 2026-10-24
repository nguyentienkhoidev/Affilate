package com.bargorya.portal.modules.offer.controller;

import com.bargorya.portal.common.dto.ApiResponse;
import com.bargorya.portal.modules.offer.dto.response.OfferResponse;
import com.bargorya.portal.modules.offer.service.OfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/stores/{slug}/offers")
@RequiredArgsConstructor
public class OfferPublicController {

    private final OfferService offerService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<OfferResponse>>> getOffers(@PathVariable("slug") String slug) {
        List<OfferResponse> offers = offerService.getPublicOffersByStore(slug);
        return ResponseEntity.ok(ApiResponse.ok(offers));
    }
}
