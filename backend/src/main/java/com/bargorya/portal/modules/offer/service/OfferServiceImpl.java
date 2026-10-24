package com.bargorya.portal.modules.offer.service;

import com.bargorya.portal.common.dto.PageResponse;
import com.bargorya.portal.common.exception.ResourceNotFoundException;
import com.bargorya.portal.common.util.SecurityUtils;
import com.bargorya.portal.modules.offer.dto.request.OfferRequest;
import com.bargorya.portal.modules.offer.dto.response.OfferResponse;
import com.bargorya.portal.modules.offer.entity.OfferEntity;
import com.bargorya.portal.modules.offer.repository.OfferRepository;
import com.bargorya.portal.modules.store.entity.StoreEntity;
import com.bargorya.portal.modules.store.repository.StoreRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OfferServiceImpl implements OfferService {

    private final OfferRepository offerRepository;
    private final StoreRepository storeRepository;

    @Override
    public List<OfferResponse> getPublicOffersByStore(String storeSlug) {
        StoreEntity store = storeRepository.findBySlugAndIsDeletedFalse(storeSlug)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "slug", storeSlug));

        return offerRepository.findByStoreIdAndIsActiveTrueAndIsDeletedFalseOrderBySortOrderAscCreatedAtDesc(store.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public PageResponse<OfferResponse> getAdminOffers(Pageable pageable, Long storeId, String search, Boolean verified) {
        Specification<OfferEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDeleted")));

            if (storeId != null) {
                predicates.add(cb.equal(root.get("store").get("id"), storeId));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("code")), pattern)
                ));
            }

            if (verified != null) {
                predicates.add(cb.equal(root.get("isVerified"), verified));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<OfferResponse> page = offerRepository.findAll(spec, pageable).map(this::mapToResponse);
        return PageResponse.from(page);
    }

    @Override
    public OfferResponse getById(Long id) {
        return offerRepository.findById(id)
                .filter(o -> !Boolean.TRUE.equals(o.getIsDeleted()))
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Offer", "id", id));
    }

    @Override
    @Transactional
    public OfferResponse create(OfferRequest request) {
        StoreEntity store = storeRepository.findById(request.getStoreId())
                .filter(s -> !Boolean.TRUE.equals(s.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", request.getStoreId()));

        OfferEntity entity = OfferEntity.builder()
                .store(store)
                .name(request.getName().trim())
                .discountValue(request.getDiscountValue().trim())
                .code(request.getCode() != null ? request.getCode().trim().toUpperCase() : null)
                .urlRef(request.getUrlRef().trim())
                .description(request.getDescription())
                .isVerified(request.getIsVerified() != null ? request.getIsVerified() : false)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 9999)
                .expireAt(request.getExpireAt())
                .build();

        entity.setCreatedBy(SecurityUtils.getCurrentUserEmail().orElse("system"));
        OfferEntity saved = offerRepository.save(entity);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public OfferResponse update(Long id, OfferRequest request) {
        OfferEntity entity = offerRepository.findById(id)
                .filter(o -> !Boolean.TRUE.equals(o.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Offer", "id", id));

        StoreEntity store = storeRepository.findById(request.getStoreId())
                .filter(s -> !Boolean.TRUE.equals(s.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", request.getStoreId()));

        entity.setStore(store);
        entity.setName(request.getName().trim());
        entity.setDiscountValue(request.getDiscountValue().trim());
        entity.setCode(request.getCode() != null ? request.getCode().trim().toUpperCase() : null);
        entity.setUrlRef(request.getUrlRef().trim());
        entity.setDescription(request.getDescription());
        if (request.getIsVerified() != null) entity.setIsVerified(request.getIsVerified());
        if (request.getIsActive() != null) entity.setIsActive(request.getIsActive());
        if (request.getSortOrder() != null) entity.setSortOrder(request.getSortOrder());
        entity.setExpireAt(request.getExpireAt());

        OfferEntity updated = offerRepository.save(entity);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public OfferResponse toggleVerify(Long id) {
        OfferEntity entity = offerRepository.findById(id)
                .filter(o -> !Boolean.TRUE.equals(o.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Offer", "id", id));

        entity.setIsVerified(!Boolean.TRUE.equals(entity.getIsVerified()));
        OfferEntity updated = offerRepository.save(entity);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public OfferResponse cloneOffer(Long id) {
        OfferEntity source = offerRepository.findById(id)
                .filter(o -> !Boolean.TRUE.equals(o.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Offer", "id", id));

        OfferEntity clone = OfferEntity.builder()
                .store(source.getStore())
                .name(source.getName() + " (Copy)")
                .discountValue(source.getDiscountValue())
                .code(source.getCode())
                .urlRef(source.getUrlRef())
                .description(source.getDescription())
                .isVerified(source.getIsVerified())
                .isActive(source.getIsActive())
                .sortOrder(source.getSortOrder())
                .expireAt(source.getExpireAt())
                .build();

        clone.setCreatedBy(SecurityUtils.getCurrentUserEmail().orElse("system"));
        OfferEntity saved = offerRepository.save(clone);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        OfferEntity entity = offerRepository.findById(id)
                .filter(o -> !Boolean.TRUE.equals(o.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Offer", "id", id));

        entity.setIsDeleted(true);
        offerRepository.save(entity);
    }

    private OfferResponse mapToResponse(OfferEntity o) {
        Long storeId = o.getStore() != null ? o.getStore().getId() : null;
        String storeName = o.getStore() != null ? o.getStore().getName() : null;
        String storeSlug = o.getStore() != null ? o.getStore().getSlug() : null;

        return new OfferResponse(
                o.getId(),
                storeId,
                storeName,
                storeSlug,
                o.getName(),
                o.getDiscountValue(),
                o.getCode(),
                o.getUrlRef(),
                o.getDescription(),
                Boolean.TRUE.equals(o.getIsVerified()),
                Boolean.TRUE.equals(o.getIsActive()),
                o.getSortOrder() != null ? o.getSortOrder() : 9999,
                o.getExpireAt()
        );
    }
}
