package com.bargorya.portal.modules.offer.service;

import com.bargorya.portal.common.dto.PageResponse;
import com.bargorya.portal.modules.offer.dto.request.OfferRequest;
import com.bargorya.portal.modules.offer.dto.response.OfferResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OfferService {
    List<OfferResponse> getPublicOffersByStore(String storeSlug);
    PageResponse<OfferResponse> getAdminOffers(Pageable pageable, Long storeId, String search, Boolean verified);
    OfferResponse getById(Long id);
    OfferResponse create(OfferRequest request);
    OfferResponse update(Long id, OfferRequest request);
    OfferResponse toggleVerify(Long id);
    OfferResponse cloneOffer(Long id);
    void delete(Long id);
}
