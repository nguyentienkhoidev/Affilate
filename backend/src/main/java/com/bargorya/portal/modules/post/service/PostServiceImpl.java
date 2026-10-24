package com.bargorya.portal.modules.post.service;

import com.bargorya.portal.common.dto.PageResponse;
import com.bargorya.portal.common.exception.DuplicateResourceException;
import com.bargorya.portal.common.exception.ResourceNotFoundException;
import com.bargorya.portal.common.util.SecurityUtils;
import com.bargorya.portal.common.util.SlugUtils;
import com.bargorya.portal.modules.category.entity.CategoryEntity;
import com.bargorya.portal.modules.category.repository.CategoryRepository;
import com.bargorya.portal.modules.post.dto.request.PostRequest;
import com.bargorya.portal.modules.post.dto.response.PostDetailResponse;
import com.bargorya.portal.modules.post.dto.response.PostSummaryResponse;
import com.bargorya.portal.modules.post.entity.PostEntity;
import com.bargorya.portal.modules.post.repository.PostRepository;
import com.bargorya.portal.modules.user.entity.UserEntity;
import com.bargorya.portal.modules.user.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Override
    public List<PostSummaryResponse> getHomeFeatured() {
        return postRepository.findFeaturedPosts(PageRequest.of(0, 1))
                .stream()
                .map(this::mapToSummary)
                .toList();
    }

    @Override
    public List<PostSummaryResponse> getEditorPicks() {
        return postRepository.findRecentPosts(PageRequest.of(0, 4))
                .stream()
                .map(this::mapToSummary)
                .toList();
    }

    @Override
    public PageResponse<PostSummaryResponse> getPublicPosts(Pageable pageable, Long categoryId, String search) {
        Specification<PostEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDeleted")));
            predicates.add(cb.isTrue(root.get("isActive")));

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("slug")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<PostSummaryResponse> page = postRepository.findAll(spec, pageable).map(this::mapToSummary);
        return PageResponse.from(page);
    }

    @Override
    @Transactional
    public PostDetailResponse getPostBySlug(String slug) {
        PostEntity post = postRepository.findBySlugAndIsDeletedFalse(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "slug", slug));

        postRepository.incrementViewCount(post.getId());
        return mapToDetail(post);
    }

    @Override
    public PageResponse<PostSummaryResponse> getAdminPosts(Pageable pageable, Long categoryId, String search, Boolean active) {
        Specification<PostEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDeleted")));

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("slug")), pattern)
                ));
            }

            if (active != null) {
                predicates.add(cb.equal(root.get("isActive"), active));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<PostSummaryResponse> page = postRepository.findAll(spec, pageable).map(this::mapToSummary);
        return PageResponse.from(page);
    }

    @Override
    public PostDetailResponse getById(Long id) {
        return postRepository.findById(id)
                .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                .map(this::mapToDetail)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", id));
    }

    @Override
    @Transactional
    public PostDetailResponse create(PostRequest request) {
        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? SlugUtils.toSlug(request.getSlug())
                : SlugUtils.toSlug(request.getTitle());

        if (postRepository.existsBySlugAndIsDeletedFalse(slug)) {
            throw new DuplicateResourceException("Post", "slug", slug);
        }

        CategoryEntity category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        }

        UserEntity author = SecurityUtils.getCurrentUserId()
                .flatMap(userRepository::findById)
                .orElse(null);

        PostEntity post = PostEntity.builder()
                .title(request.getTitle().trim())
                .slug(slug)
                .category(category)
                .author(author)
                .image(request.getImage())
                .excerpt(request.getExcerpt())
                .content(request.getContent())
                .isFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 9999)
                .publishedAt(request.getPublishedAt() != null ? request.getPublishedAt() : Instant.now())
                .metaTitle(request.getMetaTitle())
                .metaKeywords(request.getMetaKeywords())
                .metaDescription(request.getMetaDescription())
                .build();

        post.setCreatedBy(SecurityUtils.getCurrentUserEmail().orElse("system"));
        PostEntity saved = postRepository.save(post);
        return mapToDetail(saved);
    }

    @Override
    @Transactional
    public PostDetailResponse update(Long id, PostRequest request) {
        PostEntity post = postRepository.findById(id)
                .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", id));

        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? SlugUtils.toSlug(request.getSlug())
                : SlugUtils.toSlug(request.getTitle());

        if (postRepository.existsBySlugAndIdNotAndIsDeletedFalse(slug, id)) {
            throw new DuplicateResourceException("Post", "slug", slug);
        }

        CategoryEntity category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        }

        post.setTitle(request.getTitle().trim());
        post.setSlug(slug);
        post.setCategory(category);
        post.setImage(request.getImage());
        post.setExcerpt(request.getExcerpt());
        post.setContent(request.getContent());
        if (request.getIsFeatured() != null) post.setIsFeatured(request.getIsFeatured());
        if (request.getIsActive() != null) post.setIsActive(request.getIsActive());
        if (request.getSortOrder() != null) post.setSortOrder(request.getSortOrder());
        if (request.getPublishedAt() != null) post.setPublishedAt(request.getPublishedAt());
        post.setMetaTitle(request.getMetaTitle());
        post.setMetaKeywords(request.getMetaKeywords());
        post.setMetaDescription(request.getMetaDescription());

        PostEntity updated = postRepository.save(post);
        return mapToDetail(updated);
    }

    @Override
    @Transactional
    public PostDetailResponse clonePost(Long id) {
        PostEntity source = postRepository.findById(id)
                .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", id));

        String cloneTitle = source.getTitle() + " (Copy)";
        String cloneSlug = SlugUtils.toSlug(cloneTitle) + "-" + System.currentTimeMillis();

        PostEntity clone = PostEntity.builder()
                .title(cloneTitle)
                .slug(cloneSlug)
                .category(source.getCategory())
                .author(source.getAuthor())
                .image(source.getImage())
                .excerpt(source.getExcerpt())
                .content(source.getContent())
                .isFeatured(false)
                .isActive(false) // cloned posts start as draft
                .sortOrder(source.getSortOrder())
                .publishedAt(Instant.now())
                .metaTitle(source.getMetaTitle())
                .metaKeywords(source.getMetaKeywords())
                .metaDescription(source.getMetaDescription())
                .build();

        clone.setCreatedBy(SecurityUtils.getCurrentUserEmail().orElse("system"));
        PostEntity saved = postRepository.save(clone);
        return mapToDetail(saved);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        PostEntity post = postRepository.findById(id)
                .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", id));

        post.setIsDeleted(true);
        postRepository.save(post);
    }

    private PostSummaryResponse mapToSummary(PostEntity p) {
        Long catId = p.getCategory() != null ? p.getCategory().getId() : null;
        String catName = p.getCategory() != null ? p.getCategory().getName() : null;
        String authorName = p.getAuthor() != null ? p.getAuthor().getFullName() : "Editorial Team";

        return new PostSummaryResponse(
                p.getId(),
                p.getTitle(),
                p.getSlug(),
                p.getImage(),
                p.getExcerpt(),
                catId,
                catName,
                authorName,
                Boolean.TRUE.equals(p.getIsFeatured()),
                Boolean.TRUE.equals(p.getIsActive()),
                p.getPublishedAt(),
                p.getViewCount() != null ? p.getViewCount() : 0L
        );
    }

    private PostDetailResponse mapToDetail(PostEntity p) {
        Long catId = p.getCategory() != null ? p.getCategory().getId() : null;
        String catName = p.getCategory() != null ? p.getCategory().getName() : null;
        String authorName = p.getAuthor() != null ? p.getAuthor().getFullName() : "Editorial Team";

        return new PostDetailResponse(
                p.getId(),
                p.getTitle(),
                p.getSlug(),
                p.getImage(),
                p.getExcerpt(),
                p.getContent(),
                catId,
                catName,
                authorName,
                Boolean.TRUE.equals(p.getIsFeatured()),
                Boolean.TRUE.equals(p.getIsActive()),
                p.getPublishedAt(),
                p.getViewCount() != null ? p.getViewCount() : 0L,
                p.getMetaTitle(),
                p.getMetaKeywords(),
                p.getMetaDescription()
        );
    }
}
