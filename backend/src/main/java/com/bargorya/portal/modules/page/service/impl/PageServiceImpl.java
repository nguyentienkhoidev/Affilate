package com.bargorya.portal.modules.page.service.impl;

import com.bargorya.portal.common.exception.DuplicateResourceException;
import com.bargorya.portal.common.exception.ResourceNotFoundException;
import com.bargorya.portal.common.util.SlugUtils;
import com.bargorya.portal.modules.page.dto.request.PageRequest;
import com.bargorya.portal.modules.page.dto.response.PageResponse;
import com.bargorya.portal.modules.page.dto.response.PageSummaryResponse;
import com.bargorya.portal.modules.page.entity.PageEntity;
import com.bargorya.portal.modules.page.repository.PageRepository;
import com.bargorya.portal.modules.page.service.PageService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PageServiceImpl implements PageService {

    private final PageRepository pageRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse getPublicPageBySlug(String slug) {
        PageEntity entity = pageRepository.findBySlugAndIsActiveTrueAndIsDeletedFalse(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Page not found with slug: " + slug));
        return mapToPageResponse(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public com.bargorya.portal.common.dto.PageResponse<PageSummaryResponse> getPages(
            Pageable pageable, String search, Boolean isActive) {

        Specification<PageEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDeleted")));

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("slug")), pattern)
                ));
            }

            if (isActive != null) {
                predicates.add(cb.equal(root.get("isActive"), isActive));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<PageEntity> page = pageRepository.findAll(spec, pageable);
        List<PageSummaryResponse> items = page.getContent().stream()
                .map(this::mapToPageSummaryResponse)
                .toList();

        return com.bargorya.portal.common.dto.PageResponse.of(
                items, page.getNumber(), page.getSize(), page.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse getPageById(Long id) {
        PageEntity entity = pageRepository.findById(id)
                .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Page not found with id: " + id));
        return mapToPageResponse(entity);
    }

    @Override
    @Transactional
    public PageResponse createPage(PageRequest request) {
        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? SlugUtils.toSlug(request.getSlug())
                : SlugUtils.toSlug(request.getTitle());

        if (pageRepository.existsBySlugAndIsDeletedFalse(slug)) {
            throw new DuplicateResourceException("Page with slug '" + slug + "' already exists.");
        }

        PageEntity entity = PageEntity.builder()
                .title(request.getTitle().trim())
                .slug(slug)
                .image(request.getImage())
                .content(request.getContent())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 9999)
                .metaTitle(request.getMetaTitle())
                .metaDescription(request.getMetaDescription())
                .build();

        PageEntity saved = pageRepository.save(entity);
        return mapToPageResponse(saved);
    }

    @Override
    @Transactional
    public PageResponse updatePage(Long id, PageRequest request) {
        PageEntity entity = pageRepository.findById(id)
                .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Page not found with id: " + id));

        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? SlugUtils.toSlug(request.getSlug())
                : entity.getSlug();

        if (pageRepository.existsBySlugAndIdNotAndIsDeletedFalse(slug, id)) {
            throw new DuplicateResourceException("Page with slug '" + slug + "' already exists.");
        }

        entity.setTitle(request.getTitle().trim());
        entity.setSlug(slug);
        entity.setImage(request.getImage());
        entity.setContent(request.getContent());
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }
        if (request.getSortOrder() != null) {
            entity.setSortOrder(request.getSortOrder());
        }
        entity.setMetaTitle(request.getMetaTitle());
        entity.setMetaDescription(request.getMetaDescription());

        PageEntity updated = pageRepository.save(entity);
        return mapToPageResponse(updated);
    }

    @Override
    @Transactional
    public void deletePage(Long id) {
        PageEntity entity = pageRepository.findById(id)
                .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Page not found with id: " + id));

        entity.setIsDeleted(true);
        pageRepository.save(entity);
    }

    private PageResponse mapToPageResponse(PageEntity e) {
        return new PageResponse(
                e.getId(),
                e.getTitle(),
                e.getSlug(),
                e.getImage(),
                e.getContent(),
                Boolean.TRUE.equals(e.getIsActive()),
                e.getSortOrder() != null ? e.getSortOrder() : 9999,
                e.getMetaTitle(),
                e.getMetaDescription(),
                e.getCreatedAt(),
                e.getUpdatedAt()
        );
    }

    private PageSummaryResponse mapToPageSummaryResponse(PageEntity e) {
        return new PageSummaryResponse(
                e.getId(),
                e.getTitle(),
                e.getSlug(),
                e.getImage(),
                Boolean.TRUE.equals(e.getIsActive()),
                e.getSortOrder() != null ? e.getSortOrder() : 9999,
                e.getCreatedAt(),
                e.getUpdatedAt()
        );
    }
}
