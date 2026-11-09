package com.heygoodly.portal.modules.offer.service;

import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.modules.offer.dto.request.OfferRequest;
import com.heygoodly.portal.modules.offer.dto.response.OfferResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OfferService {
    List<OfferResponse> getPublicOffersByStore(String storeSlug);
    PageResponse<OfferResponse> searchPublicOffers(Pageable pageable, String search);
    PageResponse<OfferResponse> getAdminOffers(Pageable pageable, Long storeId, String search, Boolean verified);
    PageResponse<OfferResponse> getAdminOffers(Pageable pageable, Long storeId, String search, String type, Boolean verified);
    OfferResponse getById(Long id);
    OfferResponse getPublicOfferById(Long id);
    OfferResponse create(OfferRequest request);
    OfferResponse update(Long id, OfferRequest request);
    OfferResponse toggleVerify(Long id);
    OfferResponse toggleStatus(Long id);
    OfferResponse cloneOffer(Long id);
    void delete(Long id);
}
