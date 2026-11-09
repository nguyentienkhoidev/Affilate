package com.heygoodly.portal.modules.offer.service;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.constant.EntityFieldConstants;
import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.common.exception.ResourceNotFoundException;
import com.heygoodly.portal.common.util.SecurityUtils;
import com.heygoodly.portal.modules.affiliate.repository.AffiliateClickRepository;
import com.heygoodly.portal.modules.offer.dto.request.OfferRequest;
import com.heygoodly.portal.modules.offer.dto.response.OfferResponse;
import com.heygoodly.portal.modules.offer.entity.OfferEntity;
import com.heygoodly.portal.modules.offer.repository.OfferRepository;
import com.heygoodly.portal.modules.store.entity.StoreEntity;
import com.heygoodly.portal.modules.store.repository.StoreRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OfferServiceImpl implements OfferService {

    private static final String ENTITY_STORE = "Store";
    private static final String ENTITY_OFFER = "Offer";
    private static final String FIELD_ID = "id";
    private static final String FIELD_SLUG = "slug";
    private static final String FIELD_STORE_ID = "storeId";
    private static final String FIELD_IS_DELETED = "isDeleted";
    private static final String FIELD_IS_ACTIVE = "isActive";

    private final OfferRepository offerRepository;
    private final StoreRepository storeRepository;
    private final AffiliateClickRepository affiliateClickRepository;
    private final com.heygoodly.portal.modules.tag.service.TagService tagService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;
    private final com.heygoodly.portal.modules.offer.mapper.OfferMapper offerMapper;

    @Override
    public List<OfferResponse> getPublicOffersByStore(String storeSlug) {
        StoreEntity store = storeRepository.findBySlugAndIsDeletedFalse(storeSlug)
                .orElseThrow(() -> new ResourceNotFoundException(ENTITY_STORE, FIELD_SLUG, storeSlug));

        if (!Boolean.TRUE.equals(store.getIsActive())) {
            return Collections.emptyList();
        }

        List<OfferEntity> offers = offerRepository
                .findByStoreIdAndIsActiveTrueAndIsDeletedFalseOrderBySortOrderAscCreatedAtDesc(store.getId());

        List<Long> offerIds = offers.stream().map(OfferEntity::getId).toList();
        Map<Long, Long> clicksMap = offerIds.isEmpty() ? Map.of() :
                affiliateClickRepository.countClicksByOfferIds(offerIds).stream()
                        .filter(arr -> arr != null && arr.length >= 2 && arr[0] != null && arr[1] != null)
                        .collect(Collectors.toMap(
                                arr -> (Long) arr[0],
                                arr -> ((Number) arr[1]).longValue(),
                                (a, b) -> a
                        ));

        return offers.stream()
                .map(o -> mapToResponse(o, store, clicksMap.getOrDefault(o.getId(), 0L)))
                .collect(Collectors.toList());
    }

    @Override
    public PageResponse<OfferResponse> searchPublicOffers(Pageable pageable, String search) {
        Specification<OfferEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get(FIELD_IS_DELETED)));
            predicates.add(cb.isTrue(root.get(FIELD_IS_ACTIVE)));

            if (query != null) {
                jakarta.persistence.criteria.Subquery<Long> activeStoreSub = query.subquery(Long.class);
                jakarta.persistence.criteria.Root<StoreEntity> storeRoot = activeStoreSub.from(StoreEntity.class);
                activeStoreSub.select(storeRoot.get(FIELD_ID))
                        .where(
                                cb.equal(storeRoot.get(FIELD_ID), root.get(FIELD_STORE_ID)),
                                cb.isTrue(storeRoot.get(FIELD_IS_ACTIVE)),
                                cb.isFalse(storeRoot.get(FIELD_IS_DELETED))
                        );
                predicates.add(cb.exists(activeStoreSub));
            }

            if (search != null && !search.isBlank()) {
                StringBuilder patternBuilder = new StringBuilder();
                patternBuilder.append(com.heygoodly.portal.common.constant.AppConstants.PERCENT)
                        .append(search.trim().toLowerCase())
                        .append(com.heygoodly.portal.common.constant.AppConstants.PERCENT);
                String pattern = patternBuilder.toString();

                Predicate nameMatch = cb.like(cb.lower(root.get("name")), pattern);
                Predicate codeMatch = cb.like(cb.lower(root.get("code")), pattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), pattern);
                predicates.add(cb.or(nameMatch, codeMatch, descMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<OfferEntity> page = offerRepository.findAll(spec, pageable);
        return PageResponse.from(toOfferResponsePage(page));
    }

    @Override
    public PageResponse<OfferResponse> getAdminOffers(Pageable pageable, Long storeId, String search, Boolean verified) {
        return getAdminOffers(pageable, storeId, search, null, verified);
    }

    @Override
    public PageResponse<OfferResponse> getAdminOffers(Pageable pageable, Long storeId, String search, String type, Boolean verified) {
        Specification<OfferEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDeleted")));

            if (storeId != null) {
                predicates.add(cb.equal(root.get("storeId"), storeId));
            }

            if (search != null && !search.isBlank()) {
                StringBuilder patternBuilder = new StringBuilder();
                patternBuilder.append(com.heygoodly.portal.common.constant.AppConstants.PERCENT)
                        .append(search.trim().toLowerCase())
                        .append(com.heygoodly.portal.common.constant.AppConstants.PERCENT);
                String pattern = patternBuilder.toString();
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("code")), pattern)
                ));
            }

            if (type != null && !type.isBlank()) {
                String t = type.trim().toLowerCase();
                if (t.equals("coupon") || t.equals("codes") || t.equals("code")) {
                    predicates.add(cb.and(cb.isNotNull(root.get("code")), cb.notEqual(cb.trim(root.get("code")), "")));
                } else if (t.equals("deal") || t.equals("deals")) {
                    predicates.add(cb.or(cb.isNull(root.get("code")), cb.equal(cb.trim(root.get("code")), "")));
                }
            }

            if (verified != null) {
                predicates.add(cb.equal(root.get("isVerified"), verified));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<OfferEntity> page = offerRepository.findAll(spec, pageable);
        return PageResponse.from(toOfferResponsePage(page));
    }

    @Override
    public OfferResponse getById(Long id) {
        OfferEntity offer = offerRepository.findById(id)
                .filter(o -> !Boolean.TRUE.equals(o.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException(ENTITY_OFFER, FIELD_ID, id));

        StoreEntity store = (offer.getStoreId() != null)
                ? storeRepository.findById(offer.getStoreId()).orElse(null)
                : null;

        return mapToResponse(offer, store);
    }

    @Override
    public OfferResponse getPublicOfferById(Long id) {
        OfferEntity offer = offerRepository.findById(id)
                .filter(o -> !Boolean.TRUE.equals(o.getIsDeleted()) && Boolean.TRUE.equals(o.getIsActive()))
                .orElseThrow(() -> new ResourceNotFoundException(ENTITY_OFFER, FIELD_ID, id));

        StoreEntity store = (offer.getStoreId() != null)
                ? storeRepository.findById(offer.getStoreId())
                        .filter(s -> !Boolean.TRUE.equals(s.getIsDeleted()) && Boolean.TRUE.equals(s.getIsActive()))
                        .orElseThrow(() -> new ResourceNotFoundException(ENTITY_OFFER, FIELD_ID, id))
                : null;

        return mapToResponse(offer, store);
    }

    @Override
    @Transactional
    public OfferResponse create(OfferRequest request) {
        StoreEntity store = storeRepository.findById(request.getStoreId())
                .filter(s -> !Boolean.TRUE.equals(s.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException(EntityFieldConstants.ENTITY_STORE, EntityFieldConstants.ID, request.getStoreId()));

        OfferEntity entity = OfferEntity.builder()
                .storeId(store.getId())
                .name(request.getName().trim())
                .discountValue(request.getDiscountValue().trim())
                .code(request.getCode() != null ? request.getCode().trim().toUpperCase() : null)
                .urlRef(request.getUrlRef().trim())
                .description(request.getDescription())
                .image(request.getImage() != null && !request.getImage().isBlank() ? request.getImage().trim() : null)
                .isVerified(request.getIsVerified() != null ? request.getIsVerified() : false)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : com.heygoodly.portal.common.constant.AppConstants.DEFAULT_SORT_ORDER)
                .expireAt(request.getExpireAt())
                .build();

        entity.setCreatedBy(SecurityUtils.getCurrentUserEmail().orElse(AppConstants.SYSTEM_USER));
        OfferEntity saved = offerRepository.save(entity);

        if (request.getTags() != null) {
            List<String> syncedTags = tagService.syncEntityTags(EntityFieldConstants.TYPE_OFFER, saved.getId(), request.getTags());
            saved.setTags(serializeJson(syncedTags));
            saved = offerRepository.save(saved);
        }

        return mapToResponse(saved, store);
    }

    @Override
    @Transactional
    public OfferResponse update(Long id, OfferRequest request) {
        OfferEntity entity = offerRepository.findById(id)
                .filter(o -> !Boolean.TRUE.equals(o.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException(EntityFieldConstants.ENTITY_OFFER, EntityFieldConstants.ID, id));

        StoreEntity store = storeRepository.findById(request.getStoreId())
                .filter(s -> !Boolean.TRUE.equals(s.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException(EntityFieldConstants.ENTITY_STORE, EntityFieldConstants.ID, request.getStoreId()));

        entity.setStoreId(store.getId());
        entity.setName(request.getName().trim());
        entity.setDiscountValue(request.getDiscountValue().trim());
        entity.setCode(request.getCode() != null ? request.getCode().trim().toUpperCase() : null);
        entity.setUrlRef(request.getUrlRef().trim());
        entity.setDescription(request.getDescription());
        entity.setImage(request.getImage() != null && !request.getImage().isBlank() ? request.getImage().trim() : null);
        if (request.getIsVerified() != null) entity.setIsVerified(request.getIsVerified());
        if (request.getIsActive() != null) entity.setIsActive(request.getIsActive());
        if (request.getSortOrder() != null) entity.setSortOrder(request.getSortOrder());
        entity.setExpireAt(request.getExpireAt());

        if (request.getTags() != null) {
            List<String> syncedTags = tagService.syncEntityTags(EntityFieldConstants.TYPE_OFFER, entity.getId(), request.getTags());
            entity.setTags(serializeJson(syncedTags));
        }

        OfferEntity updated = offerRepository.save(entity);
        return mapToResponse(updated, store);
    }

    @Override
    @Transactional
    public OfferResponse toggleVerify(Long id) {
        OfferEntity entity = offerRepository.findById(id)
                .filter(o -> !Boolean.TRUE.equals(o.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException(EntityFieldConstants.ENTITY_OFFER, EntityFieldConstants.ID, id));

        entity.setIsVerified(!Boolean.TRUE.equals(entity.getIsVerified()));
        OfferEntity updated = offerRepository.save(entity);

        StoreEntity store = (updated.getStoreId() != null)
                ? storeRepository.findById(updated.getStoreId()).orElse(null)
                : null;

        return mapToResponse(updated, store);
    }

    @Override
    @Transactional
    public OfferResponse toggleStatus(Long id) {
        OfferEntity entity = offerRepository.findById(id)
                .filter(o -> !Boolean.TRUE.equals(o.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException(EntityFieldConstants.ENTITY_OFFER, EntityFieldConstants.ID, id));

        entity.setIsActive(!Boolean.TRUE.equals(entity.getIsActive()));
        OfferEntity updated = offerRepository.save(entity);

        StoreEntity store = (updated.getStoreId() != null)
                ? storeRepository.findById(updated.getStoreId()).orElse(null)
                : null;

        return mapToResponse(updated, store);
    }

    @Override
    @Transactional
    public OfferResponse cloneOffer(Long id) {
        OfferEntity source = offerRepository.findById(id)
                .filter(o -> !Boolean.TRUE.equals(o.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException(EntityFieldConstants.ENTITY_OFFER, EntityFieldConstants.ID, id));

        OfferEntity clone = OfferEntity.builder()
                .storeId(source.getStoreId())
                .name(source.getName() + " (Copy)")
                .discountValue(source.getDiscountValue())
                .code(source.getCode())
                .urlRef(source.getUrlRef())
                .description(source.getDescription())
                .image(source.getImage())
                .isVerified(source.getIsVerified())
                .isActive(false) // Cloned copy starts inactive
                .sortOrder(source.getSortOrder())
                .expireAt(source.getExpireAt())
                .build();

        clone.setCreatedBy(SecurityUtils.getCurrentUserEmail().orElse("system"));
        OfferEntity saved = offerRepository.save(clone);

        StoreEntity store = (saved.getStoreId() != null)
                ? storeRepository.findById(saved.getStoreId()).orElse(null)
                : null;

        return mapToResponse(saved, store);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        OfferEntity entity = offerRepository.findById(id)
                .filter(o -> !Boolean.TRUE.equals(o.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException(EntityFieldConstants.ENTITY_OFFER, EntityFieldConstants.ID, id));

        entity.setIsDeleted(true);
        offerRepository.save(entity);
    }

    /**
     * Batch maps OfferEntity page to OfferResponse with Zero N+1 query.
     */
    private Page<OfferResponse> toOfferResponsePage(Page<OfferEntity> page) {
        List<OfferEntity> content = page.getContent();
        if (content.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), page.getPageable(), page.getTotalElements());
        }

        Set<Long> storeIds = content.stream()
                .map(OfferEntity::getStoreId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<Long> offerIds = content.stream()
                .map(OfferEntity::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, StoreEntity> storeMap = storeIds.isEmpty() ? Map.of() :
                storeRepository.findAllById(storeIds).stream()
                        .collect(Collectors.toMap(StoreEntity::getId, s -> s, (a, b) -> a));

        Map<Long, Long> clicksMap = offerIds.isEmpty() ? Map.of() :
                affiliateClickRepository.countClicksByOfferIds(offerIds).stream()
                        .filter(arr -> arr != null && arr.length >= 2 && arr[0] != null && arr[1] != null)
                        .collect(Collectors.toMap(
                                arr -> (Long) arr[0],
                                arr -> ((Number) arr[1]).longValue(),
                                (a, b) -> a
                        ));

        List<OfferResponse> responses = content.stream()
                .map(o -> {
                    StoreEntity store = (o.getStoreId() != null) ? storeMap.get(o.getStoreId()) : null;
                    long uses = clicksMap.getOrDefault(o.getId(), 0L);
                    return mapToResponse(o, store, uses);
                })
                .collect(Collectors.toList());

        return new PageImpl<>(responses, page.getPageable(), page.getTotalElements());
    }

    private long getUsesCountForOffer(Long offerId) {
        if (offerId == null) return 0L;
        List<Object[]> res = affiliateClickRepository.countClicksByOfferIds(List.of(offerId));
        if (res != null && !res.isEmpty() && res.get(0).length >= 2 && res.get(0)[1] != null) {
            return ((Number) res.get(0)[1]).longValue();
        }
        return 0L;
    }

    private OfferResponse mapToResponse(OfferEntity o, StoreEntity store, long usesCount) {
        return offerMapper.toResponse(o, store, usesCount);
    }

    private OfferResponse mapToResponse(OfferEntity o, StoreEntity store) {
        return offerMapper.toResponse(o, store, getUsesCountForOffer(o.getId()));
    }

    private String serializeJson(Object object) {
        if (object == null) return null;
        try {
            return objectMapper.writeValueAsString(object);
        } catch (Exception e) {
            return null;
        }
    }

    private List<String> deserializeJson(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
