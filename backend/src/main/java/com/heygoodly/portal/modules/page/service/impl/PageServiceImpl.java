package com.heygoodly.portal.modules.page.service.impl;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.constant.EntityFieldConstants;
import com.heygoodly.portal.common.exception.DuplicateResourceException;
import com.heygoodly.portal.common.exception.ResourceNotFoundException;
import com.heygoodly.portal.common.util.NullSafeUtils;
import com.heygoodly.portal.common.util.SlugUtils;
import com.heygoodly.portal.modules.page.dto.request.PageRequest;
import com.heygoodly.portal.modules.page.dto.response.PageResponse;
import com.heygoodly.portal.modules.page.dto.response.PageSummaryResponse;
import com.heygoodly.portal.modules.page.entity.PageEntity;
import com.heygoodly.portal.modules.page.mapper.PageMapper;
import com.heygoodly.portal.modules.page.repository.PageRepository;
import com.heygoodly.portal.modules.page.service.PageService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class PageServiceImpl implements PageService {

    private final PageRepository pageRepository;
    private final PageMapper pageMapper;

    @Override
    @Transactional(readOnly = true)
    public List<PageSummaryResponse> getPublicPages() {
        log.info("Fetching all active public pages");
        List<PageEntity> pages = pageRepository.findByIsActiveTrueAndIsDeletedFalseOrderBySortOrderAsc();
        return pageMapper.toSummaryResponseList(pages);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse getPublicPageBySlug(String slug) {
        log.info("Fetching public page by slug: {}", slug);
        PageEntity entity = pageRepository.findBySlugAndIsActiveTrueAndIsDeletedFalse(slug)
                .orElseThrow(() -> new ResourceNotFoundException(EntityFieldConstants.ENTITY_PAGE, EntityFieldConstants.SLUG, slug));
        return pageMapper.toDetailResponse(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public com.heygoodly.portal.common.dto.PageResponse<PageSummaryResponse> getPages(
            Pageable pageable, String search, Boolean isActive) {
        log.info("Querying CMS pages: search='{}', isActive={}, page={}", search, isActive, pageable.getPageNumber());

        Specification<PageEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get(EntityFieldConstants.IS_DELETED)));

            if (StringUtils.hasText(search)) {
                String pattern = new StringBuilder(AppConstants.PERCENT)
                        .append(search.trim().toLowerCase())
                        .append(AppConstants.PERCENT)
                        .toString();
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get(EntityFieldConstants.TITLE)), pattern),
                        cb.like(cb.lower(root.get(EntityFieldConstants.SLUG)), pattern)
                ));
            }

            if (Objects.nonNull(isActive)) {
                predicates.add(cb.equal(root.get(EntityFieldConstants.IS_ACTIVE), isActive));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<PageEntity> page = pageRepository.findAll(spec, pageable);
        List<PageSummaryResponse> items = pageMapper.toSummaryResponseList(page.getContent());

        return com.heygoodly.portal.common.dto.PageResponse.of(
                items, page.getNumber(), page.getSize(), page.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse getPageById(Long id) {
        log.info("Fetching CMS page by id: {}", id);
        PageEntity entity = pageRepository.findById(id)
                .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException(EntityFieldConstants.ENTITY_PAGE, EntityFieldConstants.ID, id));
        return pageMapper.toDetailResponse(entity);
    }

    @Override
    @Transactional
    public PageResponse createPage(PageRequest request) {
        log.info("Creating CMS page: title={}", request.getTitle());
        String slug = StringUtils.hasText(request.getSlug())
                ? SlugUtils.toSlug(request.getSlug())
                : SlugUtils.toSlug(request.getTitle());

        if (pageRepository.existsBySlugAndIsDeletedFalse(slug)) {
            throw new DuplicateResourceException(
                    String.format("Page with slug '%s' already exists.", slug));
        }

        PageEntity entity = PageEntity.builder()
                .title(NullSafeUtils.safeTrim(request.getTitle()))
                .slug(slug)
                .image(request.getImage())
                .content(request.getContent())
                .isActive(Objects.nonNull(request.getIsActive()) ? request.getIsActive() : true)
                .sortOrder(Objects.nonNull(request.getSortOrder()) ? request.getSortOrder() : AppConstants.DEFAULT_SORT_ORDER)
                .metaTitle(request.getMetaTitle())
                .metaDescription(request.getMetaDescription())
                .build();

        PageEntity saved = pageRepository.save(entity);
        log.info("Successfully created CMS page id={}", saved.getId());
        return pageMapper.toDetailResponse(saved);
    }

    @Override
    @Transactional
    public PageResponse updatePage(Long id, PageRequest request) {
        log.info("Updating CMS page id={}", id);
        PageEntity entity = pageRepository.findById(id)
                .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException(EntityFieldConstants.ENTITY_PAGE, EntityFieldConstants.ID, id));

        String slug = StringUtils.hasText(request.getSlug())
                ? SlugUtils.toSlug(request.getSlug())
                : entity.getSlug();

        if (pageRepository.existsBySlugAndIdNotAndIsDeletedFalse(slug, id)) {
            throw new DuplicateResourceException(
                    String.format("Page with slug '%s' already exists.", slug));
        }

        entity.setTitle(NullSafeUtils.safeTrim(request.getTitle()));
        entity.setSlug(slug);
        entity.setImage(request.getImage());
        entity.setContent(request.getContent());
        if (Objects.nonNull(request.getIsActive())) {
            entity.setIsActive(request.getIsActive());
        }
        if (Objects.nonNull(request.getSortOrder())) {
            entity.setSortOrder(request.getSortOrder());
        }
        entity.setMetaTitle(request.getMetaTitle());
        entity.setMetaDescription(request.getMetaDescription());

        PageEntity updated = pageRepository.save(entity);
        log.info("Successfully updated CMS page id={}", updated.getId());
        return pageMapper.toDetailResponse(updated);
    }

    @Override
    @Transactional
    public void deletePage(Long id) {
        log.info("Soft-deleting CMS page id={}", id);
        PageEntity entity = pageRepository.findById(id)
                .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException(EntityFieldConstants.ENTITY_PAGE, EntityFieldConstants.ID, id));

        entity.setIsDeleted(true);
        pageRepository.save(entity);
        log.info("Successfully deleted CMS page id={}", id);
    }
}
