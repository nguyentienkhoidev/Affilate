package com.bargorya.portal.modules.store.service;

import com.bargorya.portal.common.dto.PageResponse;
import com.bargorya.portal.common.exception.DuplicateResourceException;
import com.bargorya.portal.common.exception.ResourceNotFoundException;
import com.bargorya.portal.common.util.SecurityUtils;
import com.bargorya.portal.common.util.SlugUtils;
import com.bargorya.portal.modules.category.entity.CategoryEntity;
import com.bargorya.portal.modules.category.repository.CategoryRepository;
import com.bargorya.portal.modules.offer.repository.OfferRepository;
import com.bargorya.portal.modules.store.dto.request.StoreRequest;
import com.bargorya.portal.modules.store.dto.response.StoreDetailResponse;
import com.bargorya.portal.modules.store.dto.response.StoreSummaryResponse;
import com.bargorya.portal.modules.store.entity.StoreEntity;
import com.bargorya.portal.modules.store.repository.StoreRepository;
import com.bargorya.portal.modules.user.entity.UserEntity;
import com.bargorya.portal.modules.user.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StoreServiceImpl implements StoreService {

    private final StoreRepository storeRepository;
    private final CategoryRepository categoryRepository;
    private final OfferRepository offerRepository;
    private final UserRepository userRepository;

    @Override
    public PageResponse<StoreSummaryResponse> getPublicStores(Pageable pageable, String search, String letter) {
        Specification<StoreEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDeleted")));
            predicates.add(cb.isTrue(root.get("isActive")));

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("slug")), pattern)
                ));
            }

            if (letter != null && !letter.isBlank() && !letter.equalsIgnoreCase("ALL")) {
                predicates.add(cb.like(cb.upper(root.get("name")), letter.trim().toUpperCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<StoreSummaryResponse> page = storeRepository.findAll(spec, pageable).map(this::mapToSummary);
        return PageResponse.from(page);
    }

    @Override
    public StoreDetailResponse getStoreBySlug(String slug) {
        return storeRepository.findBySlugAndIsDeletedFalse(slug)
                .map(this::mapToDetail)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "slug", slug));
    }

    @Override
    public PageResponse<StoreSummaryResponse> getAdminStores(Pageable pageable, String search, String network, String status) {
        Specification<StoreEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDeleted")));

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("slug")), pattern)
                ));
            }

            if (network != null && !network.isBlank() && !network.equalsIgnoreCase("ALL")) {
                predicates.add(cb.equal(root.get("afNetwork"), network.trim()));
            }

            if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
                if (status.equalsIgnoreCase("ACTIVE")) {
                    predicates.add(cb.isTrue(root.get("isActive")));
                } else if (status.equalsIgnoreCase("INACTIVE")) {
                    predicates.add(cb.isFalse(root.get("isActive")));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<StoreSummaryResponse> page = storeRepository.findAll(spec, pageable).map(this::mapToSummary);
        return PageResponse.from(page);
    }

    @Override
    public StoreDetailResponse getById(Long id) {
        return storeRepository.findById(id)
                .filter(s -> !Boolean.TRUE.equals(s.getIsDeleted()))
                .map(this::mapToDetail)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", id));
    }

    @Override
    @Transactional
    public StoreDetailResponse create(StoreRequest request) {
        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? SlugUtils.toSlug(request.getSlug())
                : SlugUtils.toSlug(request.getName());

        if (storeRepository.existsBySlugAndIsDeletedFalse(slug)) {
            throw new DuplicateResourceException("Store", "slug", slug);
        }

        CategoryEntity category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        }

        UserEntity assignedUser = null;
        if (request.getAssignedUserId() != null) {
            assignedUser = userRepository.findById(request.getAssignedUserId())
                    .orElse(null);
        }

        StoreEntity store = StoreEntity.builder()
                .name(request.getName().trim())
                .slug(slug)
                .category(category)
                .assignedUser(assignedUser)
                .logo(request.getLogo())
                .socialCardImage(request.getSocialCardImage())
                .socialTitle(request.getSocialTitle())
                .socialDescription(request.getSocialDescription())
                .aboutStore(request.getAboutStore())
                .maxOffer(request.getMaxOffer() != null ? request.getMaxOffer() : 50)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .isSearchable(request.getIsSearchable() != null ? request.getIsSearchable() : true)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 9999)
                .ratingScore(request.getRatingScore() != null ? request.getRatingScore() : BigDecimal.valueOf(5.00))
                .ratingCount(request.getRatingCount() != null ? request.getRatingCount() : 0)
                .afWebsite(request.getAfWebsite())
                .afStatus(request.getAfStatus() != null ? request.getAfStatus() : "unregistered")
                .afNetwork(request.getAfNetwork())
                .afPortalUrl(request.getAfPortalUrl())
                .afAccount(request.getAfAccount())
                .afCommission(request.getAfCommission())
                .internalNote(request.getInternalNote())
                .adsStatus(request.getAdsStatus() != null ? request.getAdsStatus() : "none")
                .adsAccount(request.getAdsAccount())
                .metaTitle(request.getMetaTitle())
                .metaKeywords(request.getMetaKeywords())
                .metaDescription(request.getMetaDescription())
                .build();

        store.setCreatedBy(SecurityUtils.getCurrentUserEmail().orElse("system"));
        StoreEntity saved = storeRepository.save(store);
        return mapToDetail(saved);
    }

    @Override
    @Transactional
    public StoreDetailResponse update(Long id, StoreRequest request) {
        StoreEntity store = storeRepository.findById(id)
                .filter(s -> !Boolean.TRUE.equals(s.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", id));

        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? SlugUtils.toSlug(request.getSlug())
                : SlugUtils.toSlug(request.getName());

        if (storeRepository.existsBySlugAndIdNotAndIsDeletedFalse(slug, id)) {
            throw new DuplicateResourceException("Store", "slug", slug);
        }

        CategoryEntity category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        }

        store.setName(request.getName().trim());
        store.setSlug(slug);
        store.setCategory(category);
        store.setLogo(request.getLogo());
        store.setSocialCardImage(request.getSocialCardImage());
        store.setSocialTitle(request.getSocialTitle());
        store.setSocialDescription(request.getSocialDescription());
        store.setAboutStore(request.getAboutStore());
        if (request.getMaxOffer() != null) store.setMaxOffer(request.getMaxOffer());
        if (request.getIsActive() != null) store.setIsActive(request.getIsActive());
        if (request.getIsSearchable() != null) store.setIsSearchable(request.getIsSearchable());
        if (request.getSortOrder() != null) store.setSortOrder(request.getSortOrder());
        if (request.getRatingScore() != null) store.setRatingScore(request.getRatingScore());
        if (request.getRatingCount() != null) store.setRatingCount(request.getRatingCount());
        store.setAfWebsite(request.getAfWebsite());
        if (request.getAfStatus() != null) store.setAfStatus(request.getAfStatus());
        store.setAfNetwork(request.getAfNetwork());
        store.setAfPortalUrl(request.getAfPortalUrl());
        store.setAfAccount(request.getAfAccount());
        store.setAfCommission(request.getAfCommission());
        store.setInternalNote(request.getInternalNote());
        if (request.getAdsStatus() != null) store.setAdsStatus(request.getAdsStatus());
        store.setAdsAccount(request.getAdsAccount());
        store.setMetaTitle(request.getMetaTitle());
        store.setMetaKeywords(request.getMetaKeywords());
        store.setMetaDescription(request.getMetaDescription());

        StoreEntity updated = storeRepository.save(store);
        return mapToDetail(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        StoreEntity store = storeRepository.findById(id)
                .filter(s -> !Boolean.TRUE.equals(s.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", id));

        store.setIsDeleted(true);
        storeRepository.save(store);
    }

    private StoreSummaryResponse mapToSummary(StoreEntity s) {
        long activeOffers = offerRepository.countByStoreIdAndIsActiveTrueAndIsDeletedFalse(s.getId());
        Long catId = s.getCategory() != null ? s.getCategory().getId() : null;
        String catName = s.getCategory() != null ? s.getCategory().getName() : null;

        return new StoreSummaryResponse(
                s.getId(),
                s.getName(),
                s.getSlug(),
                s.getLogo(),
                catId,
                catName,
                s.getMaxOffer(),
                s.getRatingScore(),
                s.getRatingCount(),
                s.getAfWebsite(),
                s.getAfVisitCount(),
                s.getAfCommission(),
                s.getAfStatus(),
                s.getAfNetwork(),
                s.getAdsStatus(),
                Boolean.TRUE.equals(s.getIsActive()),
                activeOffers
        );
    }

    private StoreDetailResponse mapToDetail(StoreEntity s) {
        Long catId = s.getCategory() != null ? s.getCategory().getId() : null;
        String catName = s.getCategory() != null ? s.getCategory().getName() : null;

        return new StoreDetailResponse(
                s.getId(),
                s.getName(),
                s.getSlug(),
                s.getLogo(),
                s.getSocialCardImage(),
                s.getSocialTitle(),
                s.getSocialDescription(),
                s.getAboutStore(),
                catId,
                catName,
                s.getMaxOffer(),
                Boolean.TRUE.equals(s.getIsActive()),
                Boolean.TRUE.equals(s.getIsSearchable()),
                s.getRatingScore(),
                s.getRatingCount(),
                s.getAfWebsite(),
                s.getAfStatus(),
                s.getAfNetwork(),
                s.getAfVisitCount(),
                s.getAfPortalUrl(),
                s.getAfAccount(),
                s.getAfCommission(),
                s.getInternalNote(),
                s.getAdsStatus(),
                s.getAdsAccount(),
                s.getMetaTitle(),
                s.getMetaKeywords(),
                s.getMetaDescription()
        );
    }
}
