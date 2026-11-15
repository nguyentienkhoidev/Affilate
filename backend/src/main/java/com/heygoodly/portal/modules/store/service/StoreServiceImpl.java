package com.heygoodly.portal.modules.store.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.constant.EntityFieldConstants;
import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.common.exception.DuplicateResourceException;
import com.heygoodly.portal.common.exception.ResourceNotFoundException;
import com.heygoodly.portal.common.util.NullSafeUtils;
import com.heygoodly.portal.common.util.SecurityUtils;
import com.heygoodly.portal.common.util.SlugUtils;
import com.heygoodly.portal.modules.category.entity.CategoryEntity;
import com.heygoodly.portal.modules.category.repository.CategoryRepository;
import com.heygoodly.portal.modules.offer.repository.OfferRepository;
import com.heygoodly.portal.modules.store.dto.request.StoreRequest;
import com.heygoodly.portal.modules.store.dto.response.ReviewerProfileDto;
import com.heygoodly.portal.modules.store.dto.response.StoreDetailResponse;
import com.heygoodly.portal.modules.store.dto.response.StoreSummaryResponse;
import com.heygoodly.portal.modules.store.entity.ReviewerProfileEntity;
import com.heygoodly.portal.modules.store.entity.StoreEntity;
import com.heygoodly.portal.modules.store.entity.StoreReviewEntity;
import com.heygoodly.portal.modules.store.repository.ReviewerProfileRepository;
import com.heygoodly.portal.modules.store.repository.StoreRepository;
import com.heygoodly.portal.modules.store.repository.StoreReviewRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StoreServiceImpl implements StoreService {

    private final StoreRepository storeRepository;
    private final StoreReviewRepository storeReviewRepository;
    private final ReviewerProfileRepository reviewerProfileRepository;
    private final CategoryRepository categoryRepository;
    private final OfferRepository offerRepository;
    private final com.heygoodly.portal.modules.tag.service.TagService tagService;
    private final ObjectMapper objectMapper;
    private final com.heygoodly.portal.modules.store.mapper.StoreMapper storeMapper;

    @Override
    public PageResponse<StoreSummaryResponse> getPublicStores(
            Pageable pageable,
            String search,
            String letter,
            String category,
            Boolean featured,
            String tag
    ) {
        final Set<Long> targetCatIds = new HashSet<>();
        if (category != null && !category.isBlank() && !category.equalsIgnoreCase("ALL")) {
            for (String catItem : category.split(",")) {
                String trimmed = catItem.trim();
                if (!trimmed.isEmpty() && !trimmed.equalsIgnoreCase("ALL")) {
                    Long cid = resolveCategoryId(trimmed);
                    if (cid != null) {
                        boolean categoryActive = categoryRepository.findById(cid)
                                .map(c -> !NullSafeUtils.safeBoolean(c.getIsDeleted()) && NullSafeUtils.safeBoolean(c.getIsActive()))
                                .orElse(false);
                        if (categoryActive) {
                            targetCatIds.add(cid);
                        }
                    }
                }
            }
            if (targetCatIds.isEmpty()) {
                return PageResponse.of(Collections.emptyList(), pageable.getPageNumber(), pageable.getPageSize(), 0L);
            }
        }

        Specification<StoreEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDeleted")));
            predicates.add(cb.isTrue(root.get("isActive")));

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("slug")), pattern),
                        cb.like(cb.lower(cb.coalesce(root.get("afWebsite"), "")), pattern),
                        cb.like(cb.lower(cb.coalesce(root.get("metaKeywords"), "")), pattern),
                        cb.like(cb.lower(cb.coalesce(root.get("aboutStore"), "")), pattern)
                ));
            }

            if (tag != null && !tag.isBlank() && !tag.equalsIgnoreCase("ALL")) {
                List<Predicate> tagPreds = new ArrayList<>();
                for (String singleTag : tag.split(",")) {
                    String cleanTag = singleTag.trim().toLowerCase().replaceAll("^#+", "");
                    if (!cleanTag.isEmpty() && !cleanTag.equalsIgnoreCase("ALL")) {
                        String tagPattern = "%" + cleanTag + "%";
                        tagPreds.add(cb.like(cb.lower(cb.coalesce(root.get("metaKeywords"), "")), tagPattern));
                        tagPreds.add(cb.like(cb.lower(root.get("slug")), tagPattern));
                        tagPreds.add(cb.like(cb.lower(root.get("name")), tagPattern));
                    }
                }
                if (!tagPreds.isEmpty()) {
                    predicates.add(cb.or(tagPreds.toArray(new Predicate[0])));
                }
            }

            if (letter != null && !letter.isBlank() && !letter.equalsIgnoreCase("ALL")) {
                predicates.add(cb.like(cb.upper(root.get("name")), letter.trim().toUpperCase() + "%"));
            }

            if (!targetCatIds.isEmpty()) {
                if (targetCatIds.size() == 1) {
                    predicates.add(cb.equal(root.get("categoryId"), targetCatIds.iterator().next()));
                } else {
                    predicates.add(root.get("categoryId").in(targetCatIds));
                }
            }

            if (Boolean.TRUE.equals(featured)) {
                predicates.add(cb.isTrue(root.get("isFeatured")));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<StoreEntity> page = storeRepository.findAll(spec, pageable);
        return PageResponse.from(toSummaryPage(page));
    }

    @Override
    public StoreDetailResponse getStoreBySlug(String slug) {
        StoreEntity store = findStoreByIdOrSlug(slug);
        if (!NullSafeUtils.safeBoolean(store.getIsActive()) && !SecurityUtils.isStaffOrAdmin()) {
            throw new ResourceNotFoundException(EntityFieldConstants.ENTITY_STORE, EntityFieldConstants.SLUG, slug);
        }
        return mapToDetail(store);
    }

    @Override
    public Long resolveCategoryId(String category) {
        if (category == null || category.isBlank() || category.equalsIgnoreCase("ALL")) {
            return null;
        }
        String clean = category.trim();
        if (clean.matches("^\\d+$")) {
            try {
                return Long.parseLong(clean);
            } catch (NumberFormatException ignored) {}
        }
        return categoryRepository.findBySlugAndIsDeletedFalse(clean.toLowerCase())
                .map(CategoryEntity::getId)
                .or(() -> categoryRepository.findAll().stream()
                        .filter(c -> !Boolean.TRUE.equals(c.getIsDeleted()) && c.getName() != null && c.getName().equalsIgnoreCase(clean))
                        .map(CategoryEntity::getId)
                        .findFirst())
                .orElse(null);
    }

    @Override
    public PageResponse<StoreSummaryResponse> getAdminStores(
            Pageable pageable,
            String search,
            String status,
            Long categoryId,
            String tag
    ) {
        Specification<StoreEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDeleted")));

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("slug")), pattern),
                        cb.like(cb.lower(cb.coalesce(root.get("afWebsite"), "")), pattern),
                        cb.like(cb.lower(cb.coalesce(root.get("metaKeywords"), "")), pattern),
                        cb.like(cb.lower(cb.coalesce(root.get("aboutStore"), "")), pattern)
                ));
            }

            if (tag != null && !tag.isBlank() && !tag.equalsIgnoreCase("ALL")) {
                List<Predicate> tagPreds = new ArrayList<>();
                for (String singleTag : tag.split(",")) {
                    String cleanTag = singleTag.trim().toLowerCase().replaceAll("^#+", "");
                    if (!cleanTag.isEmpty() && !cleanTag.equalsIgnoreCase("ALL")) {
                        String tagPattern = "%" + cleanTag + "%";
                        tagPreds.add(cb.like(cb.lower(cb.coalesce(root.get("metaKeywords"), "")), tagPattern));
                        tagPreds.add(cb.like(cb.lower(root.get("slug")), tagPattern));
                        tagPreds.add(cb.like(cb.lower(root.get("name")), tagPattern));
                    }
                }
                if (!tagPreds.isEmpty()) {
                    predicates.add(cb.or(tagPreds.toArray(new Predicate[0])));
                }
            }

            if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
                if (status.equalsIgnoreCase("ACTIVE")) {
                    predicates.add(cb.isTrue(root.get("isActive")));
                } else if (status.equalsIgnoreCase("INACTIVE")) {
                    predicates.add(cb.isFalse(root.get("isActive")));
                } else if (status.equalsIgnoreCase("FEATURED")) {
                    predicates.add(cb.isTrue(root.get("isFeatured")));
                }
            }

            if (categoryId != null && categoryId > 0) {
                predicates.add(cb.equal(root.get("categoryId"), categoryId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<StoreEntity> page = storeRepository.findAll(spec, pageable);
        return PageResponse.from(toSummaryPage(page));
    }

    @Override
    public StoreDetailResponse getById(Long id) {
        return getByIdOrSlug(String.valueOf(id));
    }

    @Override
    public StoreDetailResponse getByIdOrSlug(String idOrSlug) {
        StoreEntity store = findStoreByIdOrSlug(idOrSlug);
        return mapToDetail(store);
    }

    @Override
    @Transactional
    public StoreDetailResponse create(StoreRequest request) {
        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? SlugUtils.toSlug(request.getSlug())
                : SlugUtils.toSlug(request.getName());

        if (storeRepository.existsBySlugAndIsDeletedFalse(slug)) {
            throw new DuplicateResourceException(EntityFieldConstants.ENTITY_STORE, EntityFieldConstants.SLUG, slug);
        }

        if (request.getCategoryId() != null) {
            boolean catExists = categoryRepository.existsById(request.getCategoryId());
            if (!catExists) {
                throw new ResourceNotFoundException(EntityFieldConstants.ENTITY_CATEGORY, EntityFieldConstants.ID, request.getCategoryId());
            }
        }

        String popularSearchesJson = serializeJson(request.getPopularSearches());
        String faqsJson = serializeJson(request.getFaqs());
        String ratingBreakdownJson = serializeJson(request.getRatingBreakdown());

        StoreEntity store = StoreEntity.builder()
                .name(request.getName().trim())
                .slug(slug)
                .categoryId(request.getCategoryId())
                .assignedUserId(request.getAssignedUserId())
                .logo(request.getLogo())
                .socialCardImage(request.getSocialCardImage())
                .socialTitle(request.getSocialTitle())
                .socialDescription(request.getSocialDescription())
                .aboutStore(request.getAboutStore())
                .maxOffer(request.getMaxOffer() != null ? request.getMaxOffer() : 50)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .isSearchable(request.getIsSearchable() != null ? request.getIsSearchable() : true)
                .isFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : com.heygoodly.portal.common.constant.AppConstants.DEFAULT_SORT_ORDER)
                .ratingScore(request.getRatingScore() != null ? request.getRatingScore() : BigDecimal.valueOf(5.00))
                .ratingCount(request.getRatingCount() != null ? request.getRatingCount() : 0)
                .afWebsite(request.getAfWebsite())
                .afStatus(request.getAfStatus() != null ? request.getAfStatus() : "unregistered")
                .afPortalUrl(request.getAfPortalUrl())
                .afAccount(request.getAfAccount())
                .afCommission(request.getAfCommission())
                .internalNote(request.getInternalNote())
                .adsStatus(request.getAdsStatus() != null ? request.getAdsStatus() : "none")
                .adsAccount(request.getAdsAccount())
                .metaTitle(request.getMetaTitle())
                .metaKeywords(request.getMetaKeywords())
                .metaDescription(request.getMetaDescription())
                .popularSearches(popularSearchesJson)
                .faqs(faqsJson)
                .ratingBreakdown(ratingBreakdownJson)
                .build();

        String actor = SecurityUtils.getCurrentUserEmail().orElse(AppConstants.SYSTEM_USER);
        store.setCreatedBy(actor);
        StoreEntity saved = storeRepository.save(store);

        if (request.getTags() != null) {
            List<String> syncedTags = tagService.syncEntityTags(EntityFieldConstants.TYPE_STORE, saved.getId(), request.getTags());
            saved.setTags(serializeJson(syncedTags));
            saved = storeRepository.save(saved);
        }

        if (request.getCustomerReviews() != null) {
            syncStoreReviews(saved.getId(), request.getCustomerReviews(), actor);
        }

        return mapToDetail(saved);
    }

    @Override
    @Transactional
    public StoreDetailResponse update(Long id, StoreRequest request) {
        return updateByIdOrSlug(String.valueOf(id), request);
    }

    @Override
    @Transactional
    public StoreDetailResponse updateByIdOrSlug(String idOrSlug, StoreRequest request) {
        StoreEntity store = findStoreByIdOrSlug(idOrSlug);
        Long id = store.getId();

        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? SlugUtils.toSlug(request.getSlug())
                : SlugUtils.toSlug(request.getName());

        if (storeRepository.existsBySlugAndIdNotAndIsDeletedFalse(slug, id)) {
            throw new DuplicateResourceException(EntityFieldConstants.ENTITY_STORE, EntityFieldConstants.SLUG, slug);
        }

        if (request.getCategoryId() != null) {
            boolean catExists = categoryRepository.existsById(request.getCategoryId());
            if (!catExists) {
                throw new ResourceNotFoundException(EntityFieldConstants.ENTITY_CATEGORY, EntityFieldConstants.ID, request.getCategoryId());
            }
        }

        store.setName(request.getName().trim());
        store.setSlug(slug);
        store.setCategoryId(request.getCategoryId());
        store.setAssignedUserId(request.getAssignedUserId());
        store.setLogo(request.getLogo());
        store.setSocialCardImage(request.getSocialCardImage());
        store.setSocialTitle(request.getSocialTitle());
        store.setSocialDescription(request.getSocialDescription());
        store.setAboutStore(request.getAboutStore());
        if (request.getMaxOffer() != null) store.setMaxOffer(request.getMaxOffer());
        if (request.getIsActive() != null) store.setIsActive(request.getIsActive());
        if (request.getIsSearchable() != null) store.setIsSearchable(request.getIsSearchable());
        if (request.getIsFeatured() != null) store.setIsFeatured(request.getIsFeatured());
        if (request.getSortOrder() != null) store.setSortOrder(request.getSortOrder());
        if (request.getRatingScore() != null) store.setRatingScore(request.getRatingScore());
        if (request.getRatingCount() != null) store.setRatingCount(request.getRatingCount());
        store.setAfWebsite(request.getAfWebsite());
        if (request.getAfStatus() != null) store.setAfStatus(request.getAfStatus());
        store.setAfPortalUrl(request.getAfPortalUrl());
        store.setAfAccount(request.getAfAccount());
        store.setAfCommission(request.getAfCommission());
        store.setInternalNote(request.getInternalNote());
        if (request.getAdsStatus() != null) store.setAdsStatus(request.getAdsStatus());
        store.setAdsAccount(request.getAdsAccount());
        store.setMetaTitle(request.getMetaTitle());
        store.setMetaKeywords(request.getMetaKeywords());
        store.setMetaDescription(request.getMetaDescription());

        if (request.getPopularSearches() != null) {
            store.setPopularSearches(serializeJson(request.getPopularSearches()));
        }
        if (request.getFaqs() != null) {
            store.setFaqs(serializeJson(request.getFaqs()));
        }
        if (request.getRatingBreakdown() != null) {
            store.setRatingBreakdown(serializeJson(request.getRatingBreakdown()));
        }
        if (request.getTags() != null) {
            List<String> syncedTags = tagService.syncEntityTags(EntityFieldConstants.TYPE_STORE, store.getId(), request.getTags());
            store.setTags(serializeJson(syncedTags));
        }

        StoreEntity updated = storeRepository.save(store);
        if (request.getCustomerReviews() != null) {
            String actor = SecurityUtils.getCurrentUserEmail().orElse(AppConstants.SYSTEM_USER);
            syncStoreReviews(updated.getId(), request.getCustomerReviews(), actor);
        }
        return mapToDetail(updated);
    }

    @Override
    @Transactional
    public StoreSummaryResponse toggleStatus(Long id) {
        return toggleStatusByIdOrSlug(String.valueOf(id));
    }

    @Override
    @Transactional
    public StoreSummaryResponse toggleStatusByIdOrSlug(String idOrSlug) {
        StoreEntity store = findStoreByIdOrSlug(idOrSlug);

        store.setIsActive(!Boolean.TRUE.equals(store.getIsActive()));
        StoreEntity saved = storeRepository.save(store);

        String catName = null;
        if (saved.getCategoryId() != null) {
            catName = categoryRepository.findById(saved.getCategoryId())
                    .map(CategoryEntity::getName)
                    .orElse(null);
        }
        long activeOffers = offerRepository.countByStoreIdAndIsActiveTrueAndIsDeletedFalse(saved.getId());
        List<String> tags = deserializeJson(saved.getTags(), new TypeReference<List<String>>() {});

        return new StoreSummaryResponse(
                saved.getId(),
                saved.getName(),
                saved.getSlug(),
                saved.getLogo(),
                saved.getCategoryId(),
                catName,
                saved.getMaxOffer(),
                saved.getRatingScore(),
                saved.getRatingCount(),
                saved.getAfWebsite(),
                saved.getAfVisitCount(),
                saved.getAfCommission(),
                saved.getAfStatus(),
                saved.getAdsStatus(),
                Boolean.TRUE.equals(saved.getIsActive()),
                Boolean.TRUE.equals(saved.getIsFeatured()),
                activeOffers,
                tags != null ? tags : Collections.emptyList(),
                saved.getSortOrder() != null ? saved.getSortOrder() : com.heygoodly.portal.common.constant.AppConstants.DEFAULT_SORT_ORDER
        );
    }

    @Override
    @Transactional
    public StoreDetailResponse cloneStore(Long id) {
        return cloneStoreByIdOrSlug(String.valueOf(id));
    }

    @Override
    @Transactional
    public StoreDetailResponse cloneStoreByIdOrSlug(String idOrSlug) {
        StoreEntity source = findStoreByIdOrSlug(idOrSlug);

        long timestamp = System.currentTimeMillis();
        String newSlug = SlugUtils.toSlug(new StringBuilder()
                .append(source.getSlug())
                .append("-copy-")
                .append(timestamp % 10000)
                .toString());

        String newName = new StringBuilder()
                .append(source.getName())
                .append(" (Copy)")
                .toString();

        StoreEntity clone = StoreEntity.builder()
                .name(newName)
                .slug(newSlug)
                .categoryId(source.getCategoryId())
                .assignedUserId(source.getAssignedUserId())
                .logo(source.getLogo())
                .socialCardImage(source.getSocialCardImage())
                .socialTitle(source.getSocialTitle())
                .socialDescription(source.getSocialDescription())
                .aboutStore(source.getAboutStore())
                .maxOffer(source.getMaxOffer())
                .isActive(false) // Cloned store starts as draft/inactive
                .isSearchable(false)
                .isFeatured(false)
                .sortOrder(source.getSortOrder())
                .ratingScore(source.getRatingScore())
                .ratingCount(0)
                .afWebsite(source.getAfWebsite())
                .afStatus(source.getAfStatus())
                .afVisitCount(0L)
                .afPortalUrl(source.getAfPortalUrl())
                .afAccount(source.getAfAccount())
                .afCommission(source.getAfCommission())
                .internalNote(source.getInternalNote())
                .adsStatus(source.getAdsStatus())
                .adsAccount(source.getAdsAccount())
                .metaTitle(source.getMetaTitle())
                .metaKeywords(source.getMetaKeywords())
                .metaDescription(source.getMetaDescription())
                .popularSearches(source.getPopularSearches())
                .faqs(source.getFaqs())
                .build();

        clone.setCreatedBy(SecurityUtils.getCurrentUserEmail().orElse("system"));
        StoreEntity saved = storeRepository.save(clone);
        return mapToDetail(saved);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        deleteByIdOrSlug(String.valueOf(id));
    }

    @Override
    @Transactional
    public void deleteByIdOrSlug(String idOrSlug) {
        StoreEntity store = findStoreByIdOrSlug(idOrSlug);
        store.setIsDeleted(true);
        store.setSlug(new StringBuilder().append(store.getSlug()).append(AppConstants.HYPHEN).append("deleted").append(AppConstants.HYPHEN).append(System.currentTimeMillis()).toString());
        storeRepository.save(store);
    }

    /**
     * Resolves a store entity by ID or slug (supports legacy prefixed slugs like 's-anker' -> 'anker')
     */
    private StoreEntity findStoreByIdOrSlug(String idOrSlug) {
        if (idOrSlug == null || idOrSlug.isBlank()) {
            throw new ResourceNotFoundException(EntityFieldConstants.ENTITY_STORE, EntityFieldConstants.ID, "empty");
        }
        String clean = idOrSlug.trim();
        if (clean.matches("^\\d+$")) {
            Long id = Long.parseLong(clean);
            return storeRepository.findById(id)
                    .filter(s -> !Boolean.TRUE.equals(s.getIsDeleted()))
                    .orElseThrow(() -> new ResourceNotFoundException(EntityFieldConstants.ENTITY_STORE, EntityFieldConstants.ID, id));
        }

        // 1. Try exact slug
        Optional<StoreEntity> bySlug = storeRepository.findBySlugAndIsDeletedFalse(clean);
        if (bySlug.isPresent()) {
            return bySlug.get();
        }

        // 2. Try slug without 's-' prefix
        if (clean.startsWith("s-")) {
            String stripped = clean.substring(2);
            Optional<StoreEntity> byStripped = storeRepository.findBySlugAndIsDeletedFalse(stripped);
            if (byStripped.isPresent()) {
                return byStripped.get();
            }
        }

        throw new ResourceNotFoundException(EntityFieldConstants.ENTITY_STORE, EntityFieldConstants.SLUG, clean);
    }

    /**
     * Batch maps a Page<StoreEntity> to Page<StoreSummaryResponse> with ZERO N+1 queries.
     */
    private Page<StoreSummaryResponse> toSummaryPage(Page<StoreEntity> page) {
        List<StoreEntity> stores = page.getContent();
        if (stores.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), page.getPageable(), page.getTotalElements());
        }

        // 1. Batch fetch active offers count for all stores in this page
        Set<Long> storeIds = stores.stream().map(StoreEntity::getId).collect(Collectors.toSet());
        Map<Long, Long> offerCountMap = offerRepository.countActiveOffersByStoreIds(storeIds).stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));

        // 2. Batch fetch category names for all stores in this page
        Set<Long> catIds = stores.stream()
                .map(StoreEntity::getCategoryId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, String> categoryMap = catIds.isEmpty() ? Collections.emptyMap() :
                categoryRepository.findAllById(catIds).stream()
                        .collect(Collectors.toMap(CategoryEntity::getId, CategoryEntity::getName));

        // 3. Map entities in memory using dedicated StoreMapper
        List<StoreSummaryResponse> summaries = stores.stream()
                .map(s -> {
                    long activeOffers = offerCountMap.getOrDefault(s.getId(), 0L);
                    String catName = Objects.nonNull(s.getCategoryId()) ? categoryMap.get(s.getCategoryId()) : null;
                    return storeMapper.toSummaryResponse(s, activeOffers, catName);
                })
                .collect(Collectors.toList());

        return new PageImpl<>(summaries, page.getPageable(), page.getTotalElements());
    }

    private StoreDetailResponse mapToDetail(StoreEntity s) {
        String catName = null;
        if (Objects.nonNull(s.getCategoryId())) {
            catName = categoryRepository.findById(s.getCategoryId())
                    .map(CategoryEntity::getName)
                    .orElse(null);
        }
        List<StoreReviewEntity> reviews = storeReviewRepository.findByStoreIdAndIsDeletedFalseOrderBySortOrderAscIdAsc(s.getId());
        return storeMapper.toDetailResponse(s, catName, reviews);
    }

    @Override
    public List<ReviewerProfileDto> searchReviewerProfiles(String search) {
        String trimmed = NullSafeUtils.safeTrim(search);
        List<ReviewerProfileEntity> profiles = trimmed.isEmpty()
                ? reviewerProfileRepository.findTop20ByIsDeletedFalseOrderByUpdatedAtDescIdDesc()
                : reviewerProfileRepository.findTop20ByIsDeletedFalseAndNameContainingIgnoreCaseOrderByNameAsc(trimmed);
        return profiles.stream()
                .map(p -> new ReviewerProfileDto(
                        p.getId(),
                        p.getName(),
                        p.getAvatarUrl(),
                        Boolean.TRUE.equals(p.getIsVerified())
                ))
                .toList();
    }

    private void syncStoreReviews(Long storeId, List<StoreRequest.StoreReviewDto> reviewDtos, String actor) {
        storeReviewRepository.deleteByStoreId(storeId);
        if (reviewDtos == null || reviewDtos.isEmpty()) {
            return;
        }

        // Batch-fetch & upsert reusable reviewer profiles (zero N+1)
        Set<String> lowerNames = new HashSet<>();
        for (StoreRequest.StoreReviewDto dto : reviewDtos) {
            String trimmedName = NullSafeUtils.safeTrim(dto.getReviewerName());
            if (!trimmedName.isEmpty() && !trimmedName.equalsIgnoreCase(AppConstants.DEFAULT_REVIEWER_NAME)) {
                lowerNames.add(trimmedName.toLowerCase());
            }
        }

        Map<String, ReviewerProfileEntity> profileMap = new java.util.HashMap<>();
        if (!lowerNames.isEmpty()) {
            for (ReviewerProfileEntity existing : reviewerProfileRepository.findByLowerNames(lowerNames)) {
                profileMap.put(existing.getName().toLowerCase(), existing);
            }
            List<ReviewerProfileEntity> profilesToSave = new ArrayList<>();
            for (StoreRequest.StoreReviewDto dto : reviewDtos) {
                String trimmedName = NullSafeUtils.safeTrim(dto.getReviewerName());
                if (trimmedName.isEmpty() || trimmedName.equalsIgnoreCase(AppConstants.DEFAULT_REVIEWER_NAME)) {
                    continue;
                }
                String key = trimmedName.toLowerCase();
                String avatar = NullSafeUtils.safeTrim(dto.getReviewerAvatar());
                boolean verified = dto.getIsVerified() == null || Boolean.TRUE.equals(dto.getIsVerified());

                ReviewerProfileEntity profile = profileMap.get(key);
                if (profile == null) {
                    profile = ReviewerProfileEntity.builder()
                            .name(trimmedName)
                            .avatarUrl(avatar.isEmpty() ? null : avatar)
                            .isVerified(verified)
                            .build();
                    profile.setCreatedBy(actor);
                    profileMap.put(key, profile);
                    profilesToSave.add(profile);
                } else {
                    boolean changed = false;
                    if (!avatar.isEmpty() && !avatar.equals(profile.getAvatarUrl())) {
                        profile.setAvatarUrl(avatar);
                        changed = true;
                    }
                    if (Boolean.TRUE.equals(profile.getIsVerified()) != verified) {
                        profile.setIsVerified(verified);
                        changed = true;
                    }
                    if (changed) {
                        profilesToSave.add(profile);
                    }
                }
            }
            if (!profilesToSave.isEmpty()) {
                for (ReviewerProfileEntity savedProfile : reviewerProfileRepository.saveAll(profilesToSave)) {
                    profileMap.put(savedProfile.getName().toLowerCase(), savedProfile);
                }
            }
        }

        List<StoreReviewEntity> entities = new ArrayList<>();
        for (int i = 0; i < reviewDtos.size(); i++) {
            StoreRequest.StoreReviewDto dto = reviewDtos.get(i);
            String reviewerName = NullSafeUtils.safeTrim(dto.getReviewerName());
            String comment = NullSafeUtils.safeTrim(dto.getComment());
            if (reviewerName.isEmpty() && comment.isEmpty()) {
                continue;
            }
            int boundedRating = dto.getRating() != null ? Math.min(5, Math.max(1, dto.getRating())) : 5;
            ReviewerProfileEntity linkedProfile = reviewerName.isEmpty() ? null : profileMap.get(reviewerName.toLowerCase());
            Long profileId = linkedProfile != null ? linkedProfile.getId() : dto.getReviewerProfileId();

            StoreReviewEntity entity = StoreReviewEntity.builder()
                    .storeId(storeId)
                    .reviewerProfileId(profileId)
                    .reviewerName(reviewerName.isEmpty() ? AppConstants.DEFAULT_REVIEWER_NAME : reviewerName)
                    .reviewerAvatar(NullSafeUtils.safeTrim(dto.getReviewerAvatar()))
                    .isVerified(dto.getIsVerified() == null || Boolean.TRUE.equals(dto.getIsVerified()))
                    .rating(boundedRating)
                    .reviewDateLabel(NullSafeUtils.safeTrim(dto.getReviewDateLabel()))
                    .comment(comment)
                    .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : i)
                    .isActive(dto.getIsActive() == null || Boolean.TRUE.equals(dto.getIsActive()))
                    .build();
            entity.setCreatedBy(actor);
            entities.add(entity);
        }
        if (!entities.isEmpty()) {
            storeReviewRepository.saveAll(entities);
        }
    }

    private String serializeJson(Object object) {
        if (object == null) return null;
        try {
            return objectMapper.writeValueAsString(object);
        } catch (Exception e) {
            log.warn("Failed to serialize json: {}", e.getMessage());
            return null;
        }
    }

    @Override
    @Transactional
    public void reorder(List<Long> orderedIds) {
        com.heygoodly.portal.common.util.SortOrderUtils.reorderEntities(
                orderedIds, storeRepository, StoreEntity::getId, StoreEntity::setSortOrder);
    }

    private <T> T deserializeJson(String json, TypeReference<T> typeRef) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, typeRef);
        } catch (Exception e) {
            log.warn("Failed to deserialize json: {}", e.getMessage());
            return null;
        }
    }
}
