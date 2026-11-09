package com.heygoodly.portal.modules.category.service;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.common.exception.AppException;
import com.heygoodly.portal.common.exception.ErrorCode;
import com.heygoodly.portal.common.util.NullSafeUtils;
import com.heygoodly.portal.common.util.SecurityUtils;
import com.heygoodly.portal.common.util.SlugUtils;
import com.heygoodly.portal.modules.category.dto.request.CategoryRequest;
import com.heygoodly.portal.modules.category.dto.response.CategoryResponse;
import com.heygoodly.portal.modules.category.entity.CategoryEntity;
import com.heygoodly.portal.modules.category.repository.CategoryRepository;
import com.heygoodly.portal.modules.post.repository.PostRepository;
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
public class CategoryServiceImpl implements CategoryService {

    private static final String TYPE_POST = "post";
    private static final String TYPE_STORE = "store";
    private static final String TYPE_ALL = "all";
    private static final String FIELD_IS_DELETED = "isDeleted";
    private static final String FIELD_IS_ACTIVE = "isActive";
    private static final String FIELD_TYPE = "type";
    private static final String FIELD_NAME = "name";
    private static final String FIELD_SLUG = "slug";
    private static final String FIELD_DESCRIPTION = "description";
    private static final String DELETED_SEGMENT = "deleted";
    private static final String ERR_SELF_PARENT = "Category cannot be its own parent.";

    private final CategoryRepository categoryRepository;
    private final PostRepository postRepository;
    private final StoreRepository storeRepository;
    private final com.heygoodly.portal.modules.category.mapper.CategoryMapper categoryMapper;

    @Override
    public List<CategoryResponse> getPublicCategories(String type) {
        String queryType = NullSafeUtils.safeLowerTrim(type);
        if (queryType.isEmpty()) {
            queryType = TYPE_POST;
        }

        if (TYPE_ALL.equalsIgnoreCase(queryType)) {
            List<CategoryEntity> allActive = categoryRepository.findByIsActiveTrueAndIsDeletedFalseOrderBySortOrderAsc();
            return mapToResponseList(allActive);
        }

        if (TYPE_STORE.equalsIgnoreCase(queryType)) {
            List<CategoryEntity> allActive = categoryRepository.findByIsActiveTrueAndIsDeletedFalseOrderBySortOrderAsc();
            List<CategoryResponse> mapped = mapToResponseList(allActive);
            return mapped.stream()
                    .filter(c -> TYPE_STORE.equalsIgnoreCase(c.type()) || c.storeCount() > 0)
                    .toList();
        }

        List<CategoryEntity> entities = categoryRepository
                .findByTypeAndIsActiveTrueAndIsDeletedFalseOrderBySortOrderAsc(queryType);
        return mapToResponseList(entities);
    }

    @Override
    public PageResponse<CategoryResponse> getPublicCategories(Pageable pageable, String type, String search) {
        String queryType = NullSafeUtils.safeLowerTrim(type);
        if (queryType.isEmpty()) {
            queryType = TYPE_POST;
        }
        final String effectiveType = queryType;
        final String cleanSearch = NullSafeUtils.safeLowerTrim(search);

        Specification<CategoryEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get(FIELD_IS_DELETED)));
            predicates.add(cb.isTrue(root.get(FIELD_IS_ACTIVE)));
            if (!TYPE_ALL.equalsIgnoreCase(effectiveType)) {
                predicates.add(cb.equal(root.get(FIELD_TYPE), effectiveType));
            }
            if (!cleanSearch.isEmpty()) {
                String pattern = new StringBuilder()
                        .append(AppConstants.PERCENT)
                        .append(cleanSearch)
                        .append(AppConstants.PERCENT)
                        .toString();
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get(FIELD_NAME)), pattern),
                        cb.like(cb.lower(root.get(FIELD_SLUG)), pattern),
                        cb.like(cb.lower(cb.coalesce(root.get(FIELD_DESCRIPTION), AppConstants.EMPTY)), pattern)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        Page<CategoryEntity> page = categoryRepository.findAll(spec, pageable);
        List<CategoryResponse> content = mapToResponseList(page.getContent());
        return PageResponse.of(content, page.getNumber(), page.getSize(), page.getTotalElements());
    }

    @Override
    public List<CategoryResponse> getHomeCategories() {
        List<CategoryEntity> entities = categoryRepository
                .findByShowOnHomeTrueAndIsActiveTrueAndIsDeletedFalseOrderBySortOrderAsc();
        return mapToResponseList(entities);
    }

    @Override
    public CategoryResponse getCategoryBySlug(String slug) {
        String cleanSlug = NullSafeUtils.safeLowerTrim(slug);
        CategoryEntity entity = categoryRepository.findBySlugAndIsDeletedFalse(cleanSlug)
                .filter(c -> NullSafeUtils.safeBoolean(c.getIsActive()))
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        String parentName = null;
        if (entity.getParentId() != null) {
            parentName = categoryRepository.findById(entity.getParentId())
                    .map(CategoryEntity::getName)
                    .orElse(null);
        }

        long postCount = postRepository.countByCategoryIdAndIsDeletedFalse(entity.getId());
        long storeCount = storeRepository.countActiveByCategoryId(entity.getId());
        return mapToResponse(entity, parentName, postCount, storeCount);
    }

    @Override
    public PageResponse<CategoryResponse> getAdminCategories(Pageable pageable, String search, String type) {
        final String cleanSearch = NullSafeUtils.safeLowerTrim(search);
        final String cleanType = NullSafeUtils.safeLowerTrim(type);

        Specification<CategoryEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get(FIELD_IS_DELETED)));

            if (!cleanSearch.isEmpty()) {
                String likePattern = new StringBuilder()
                        .append(AppConstants.PERCENT)
                        .append(cleanSearch)
                        .append(AppConstants.PERCENT)
                        .toString();
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get(FIELD_NAME)), likePattern),
                        cb.like(cb.lower(root.get(FIELD_SLUG)), likePattern)
                ));
            }

            if (!cleanType.isEmpty() && !TYPE_ALL.equalsIgnoreCase(cleanType)) {
                predicates.add(cb.equal(root.get(FIELD_TYPE), cleanType));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<CategoryEntity> page = categoryRepository.findAll(spec, pageable);
        List<CategoryResponse> content = mapToResponseList(page.getContent());
        Page<CategoryResponse> mappedPage = new PageImpl<>(content, pageable, page.getTotalElements());

        return PageResponse.from(mappedPage);
    }

    @Override
    public CategoryResponse getById(Long id) {
        CategoryEntity entity = categoryRepository.findById(id)
                .filter(c -> !NullSafeUtils.safeBoolean(c.getIsDeleted()))
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        String parentName = null;
        if (entity.getParentId() != null) {
            parentName = categoryRepository.findById(entity.getParentId())
                    .map(CategoryEntity::getName)
                    .orElse(null);
        }

        long postCount = postRepository.countByCategoryIdAndIsDeletedFalse(entity.getId());
        long storeCount = storeRepository.countActiveByCategoryId(entity.getId());
        return mapToResponse(entity, parentName, postCount, storeCount);
    }

    @Override
    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        String rawSlug = NullSafeUtils.safeTrim(request.getSlug());
        String slug = !rawSlug.isEmpty()
                ? SlugUtils.toSlug(rawSlug)
                : SlugUtils.toSlug(request.getName());

        if (categoryRepository.existsBySlugAndIsDeletedFalse(slug)) {
            throw new AppException(ErrorCode.DUPLICATE_RESOURCE);
        }

        if (request.getParentId() != null && !categoryRepository.existsById(request.getParentId())) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        String resolvedType = NullSafeUtils.safeLowerTrim(request.getType());
        if (resolvedType.isEmpty()) {
            resolvedType = TYPE_POST;
        }

        CategoryEntity entity = CategoryEntity.builder()
                .name(NullSafeUtils.safeTrim(request.getName()))
                .slug(slug)
                .type(resolvedType)
                .parentId(request.getParentId())
                .image(request.getImage())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .showOnHome(NullSafeUtils.safeBoolean(request.getShowOnHome()))
                .sortOrder(NullSafeUtils.safeInt(request.getSortOrder(), AppConstants.DEFAULT_SORT_ORDER))
                .description(request.getDescription())
                .metaTitle(request.getMetaTitle())
                .metaKeywords(request.getMetaKeywords())
                .metaDescription(request.getMetaDescription())
                .build();

        entity.setCreatedBy(SecurityUtils.getCurrentUserEmail().orElse(AppConstants.SYSTEM_USER));
        CategoryEntity saved = categoryRepository.save(entity);

        String parentName = null;
        if (saved.getParentId() != null) {
            parentName = categoryRepository.findById(saved.getParentId())
                    .map(CategoryEntity::getName)
                    .orElse(null);
        }

        long postCount = postRepository.countByCategoryIdAndIsDeletedFalse(saved.getId());
        long storeCount = storeRepository.countActiveByCategoryId(saved.getId());
        return mapToResponse(saved, parentName, postCount, storeCount);
    }

    @Override
    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        CategoryEntity entity = categoryRepository.findById(id)
                .filter(c -> !NullSafeUtils.safeBoolean(c.getIsDeleted()))
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        String rawSlug = NullSafeUtils.safeTrim(request.getSlug());
        String slug = !rawSlug.isEmpty()
                ? SlugUtils.toSlug(rawSlug)
                : SlugUtils.toSlug(request.getName());

        if (categoryRepository.existsBySlugAndIdNotAndIsDeletedFalse(slug, id)) {
            throw new AppException(ErrorCode.DUPLICATE_RESOURCE);
        }

        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new AppException(ErrorCode.BAD_REQUEST, ERR_SELF_PARENT);
            }
            if (!categoryRepository.existsById(request.getParentId())) {
                throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
            }
        }

        entity.setName(NullSafeUtils.safeTrim(request.getName()));
        entity.setSlug(slug);
        if (request.getType() != null) {
            entity.setType(NullSafeUtils.safeLowerTrim(request.getType()));
        }
        entity.setParentId(request.getParentId());
        entity.setImage(request.getImage());
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }
        if (request.getShowOnHome() != null) {
            entity.setShowOnHome(request.getShowOnHome());
        }
        if (request.getSortOrder() != null) {
            entity.setSortOrder(request.getSortOrder());
        }
        entity.setDescription(request.getDescription());
        entity.setMetaTitle(request.getMetaTitle());
        entity.setMetaKeywords(request.getMetaKeywords());
        entity.setMetaDescription(request.getMetaDescription());

        CategoryEntity updated = categoryRepository.save(entity);

        String parentName = null;
        if (updated.getParentId() != null) {
            parentName = categoryRepository.findById(updated.getParentId())
                    .map(CategoryEntity::getName)
                    .orElse(null);
        }

        long postCount = postRepository.countByCategoryIdAndIsDeletedFalse(updated.getId());
        long storeCount = storeRepository.countActiveByCategoryId(updated.getId());
        return mapToResponse(updated, parentName, postCount, storeCount);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        CategoryEntity entity = categoryRepository.findById(id)
                .filter(c -> !NullSafeUtils.safeBoolean(c.getIsDeleted()))
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        entity.setIsDeleted(true);
        entity.setSlug(new StringBuilder()
                .append(entity.getSlug())
                .append(AppConstants.HYPHEN)
                .append(DELETED_SEGMENT)
                .append(AppConstants.HYPHEN)
                .append(System.currentTimeMillis())
                .toString());
        categoryRepository.save(entity);
    }

    /**
     * Batch maps a list of CategoryEntity to CategoryResponse with ZERO N+1 queries.
     */
    private List<CategoryResponse> mapToResponseList(List<CategoryEntity> entities) {
        if (entities == null || entities.isEmpty()) {
            return List.of();
        }

        Set<Long> parentIds = entities.stream()
                .map(CategoryEntity::getParentId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, String> parentNameMap = parentIds.isEmpty()
                ? Collections.emptyMap()
                : categoryRepository.findAllById(parentIds).stream()
                        .collect(Collectors.toMap(
                                CategoryEntity::getId,
                                cat -> NullSafeUtils.safeTrim(cat.getName()),
                                (a, b) -> a
                        ));

        Map<Long, Long> postCountMap = postRepository.countPostsGroupedByCategory().stream()
                .filter(arr -> arr != null && arr.length >= 2 && arr[0] != null && arr[1] != null)
                .collect(Collectors.toMap(
                        arr -> (Long) arr[0],
                        arr -> ((Number) arr[1]).longValue(),
                        (a, b) -> a
                ));

        Map<Long, Long> storeCountMap = storeRepository.countActiveStoresGroupedByCategory().stream()
                .filter(arr -> arr != null && arr.length >= 2 && arr[0] != null && arr[1] != null)
                .collect(Collectors.toMap(
                        arr -> (Long) arr[0],
                        arr -> ((Number) arr[1]).longValue(),
                        (a, b) -> a
                ));

        return entities.stream()
                .map(entity -> {
                    String parentName = (entity.getParentId() != null)
                            ? parentNameMap.get(entity.getParentId())
                            : null;
                    long postCount = postCountMap.getOrDefault(entity.getId(), 0L);
                    long storeCount = storeCountMap.getOrDefault(entity.getId(), 0L);
                    return mapToResponse(entity, parentName, postCount, storeCount);
                })
                .toList();
    }

    private CategoryResponse mapToResponse(CategoryEntity entity, String parentName, long postCount, long storeCount) {
        return categoryMapper.toResponse(entity, parentName, postCount, storeCount);
    }
}
