package com.bargorya.portal.modules.category.service;

import com.bargorya.portal.common.dto.PageResponse;
import com.bargorya.portal.common.exception.DuplicateResourceException;
import com.bargorya.portal.common.exception.ResourceNotFoundException;
import com.bargorya.portal.common.util.SecurityUtils;
import com.bargorya.portal.common.util.SlugUtils;
import com.bargorya.portal.modules.category.dto.request.CategoryRequest;
import com.bargorya.portal.modules.category.dto.response.CategoryResponse;
import com.bargorya.portal.modules.category.entity.CategoryEntity;
import com.bargorya.portal.modules.category.repository.CategoryRepository;
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
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public List<CategoryResponse> getPublicCategories(String type) {
        String queryType = (type != null && !type.isBlank()) ? type.trim().toLowerCase() : "post";
        return categoryRepository.findByTypeAndIsActiveTrueAndIsDeletedFalseOrderBySortOrderAsc(queryType)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<CategoryResponse> getHomeCategories() {
        return categoryRepository.findByShowOnHomeTrueAndIsActiveTrueAndIsDeletedFalseOrderBySortOrderAsc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public CategoryResponse getCategoryBySlug(String slug) {
        return categoryRepository.findBySlugAndIsDeletedFalse(slug)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "slug", slug));
    }

    @Override
    public PageResponse<CategoryResponse> getAdminCategories(Pageable pageable, String search, String type) {
        Specification<CategoryEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDeleted")));

            if (search != null && !search.isBlank()) {
                String likePattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), likePattern),
                        cb.like(cb.lower(root.get("slug")), likePattern)
                ));
            }

            if (type != null && !type.isBlank()) {
                predicates.add(cb.equal(root.get("type"), type.trim().toLowerCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<CategoryResponse> page = categoryRepository.findAll(spec, pageable).map(this::mapToResponse);
        return PageResponse.from(page);
    }

    @Override
    public CategoryResponse getById(Long id) {
        return categoryRepository.findById(id)
                .filter(c -> !Boolean.TRUE.equals(c.getIsDeleted()))
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    @Override
    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? SlugUtils.toSlug(request.getSlug())
                : SlugUtils.toSlug(request.getName());

        if (categoryRepository.existsBySlugAndIsDeletedFalse(slug)) {
            throw new DuplicateResourceException("Category", "slug", slug);
        }

        CategoryEntity parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent Category", "id", request.getParentId()));
        }

        CategoryEntity entity = CategoryEntity.builder()
                .name(request.getName().trim())
                .slug(slug)
                .type(request.getType() != null ? request.getType().toLowerCase() : "post")
                .parent(parent)
                .image(request.getImage())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .showOnHome(request.getShowOnHome() != null ? request.getShowOnHome() : false)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 9999)
                .description(request.getDescription())
                .metaTitle(request.getMetaTitle())
                .metaKeywords(request.getMetaKeywords())
                .metaDescription(request.getMetaDescription())
                .build();

        entity.setCreatedBy(SecurityUtils.getCurrentUserEmail().orElse("system"));
        CategoryEntity saved = categoryRepository.save(entity);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        CategoryEntity entity = categoryRepository.findById(id)
                .filter(c -> !Boolean.TRUE.equals(c.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? SlugUtils.toSlug(request.getSlug())
                : SlugUtils.toSlug(request.getName());

        if (categoryRepository.existsBySlugAndIdNotAndIsDeletedFalse(slug, id)) {
            throw new DuplicateResourceException("Category", "slug", slug);
        }

        CategoryEntity parent = null;
        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new IllegalArgumentException("Category cannot be its own parent.");
            }
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent Category", "id", request.getParentId()));
        }

        entity.setName(request.getName().trim());
        entity.setSlug(slug);
        if (request.getType() != null) {
            entity.setType(request.getType().toLowerCase());
        }
        entity.setParent(parent);
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
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        CategoryEntity entity = categoryRepository.findById(id)
                .filter(c -> !Boolean.TRUE.equals(c.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        entity.setIsDeleted(true);
        categoryRepository.save(entity);
    }

    private CategoryResponse mapToResponse(CategoryEntity entity) {
        Long parentId = entity.getParent() != null ? entity.getParent().getId() : null;
        String parentName = entity.getParent() != null ? entity.getParent().getName() : null;

        return new CategoryResponse(
                entity.getId(),
                entity.getName(),
                entity.getSlug(),
                entity.getType(),
                parentId,
                parentName,
                entity.getImage(),
                Boolean.TRUE.equals(entity.getIsActive()),
                Boolean.TRUE.equals(entity.getShowOnHome()),
                entity.getSortOrder() != null ? entity.getSortOrder() : 9999,
                entity.getDescription(),
                entity.getMetaTitle(),
                entity.getMetaKeywords(),
                entity.getMetaDescription()
        );
    }
}
