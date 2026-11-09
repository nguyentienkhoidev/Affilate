package com.heygoodly.portal.modules.post.service;

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
import com.heygoodly.portal.modules.post.constant.PostConstants;
import com.heygoodly.portal.modules.post.constant.PostStatus;
import com.heygoodly.portal.modules.post.dto.request.PostAdminQueryCriteria;
import com.heygoodly.portal.modules.post.dto.request.PostPublicQueryCriteria;
import com.heygoodly.portal.modules.post.dto.request.PostRequest;
import com.heygoodly.portal.modules.post.dto.response.PostDetailResponse;
import com.heygoodly.portal.modules.post.dto.response.PostStatsResponse;
import com.heygoodly.portal.modules.post.dto.response.PostSummaryResponse;
import com.heygoodly.portal.modules.post.entity.PostEntity;
import com.heygoodly.portal.modules.post.repository.PostRepository;
import com.heygoodly.portal.modules.store.entity.StoreEntity;
import com.heygoodly.portal.modules.store.repository.StoreRepository;
import com.heygoodly.portal.modules.user.entity.UserEntity;
import com.heygoodly.portal.modules.user.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final com.heygoodly.portal.modules.tag.service.TagService tagService;
    private final com.heygoodly.portal.modules.tag.repository.TagRepository tagRepository;
    private final com.heygoodly.portal.modules.tag.repository.EntityTagRepository entityTagRepository;
    private final ObjectMapper objectMapper;
    private final com.heygoodly.portal.modules.post.mapper.PostMapper postMapper;

    @Override
    public List<String> getTrendingTags() {
        Set<String> seen = new LinkedHashSet<>();

        List<String> jsonTagsList = postRepository.findActiveTagsJson();
        if (jsonTagsList != null) {
            for (String rawJson : jsonTagsList) {
                List<String> parsed = parseTagsJson(rawJson);
                for (String item : parsed) {
                    String clean = NullSafeUtils.safeTrim(item);
                    if (!clean.isEmpty()) {
                        seen.add(clean);
                    }
                }
            }
        }

        List<String> rawKeywords = postRepository.findActiveMetaKeywords();
        if (rawKeywords != null) {
            for (String kwStr : rawKeywords) {
                String trimmedKw = NullSafeUtils.safeTrim(kwStr);
                if (trimmedKw.isEmpty()) {
                    continue;
                }
                String[] split = trimmedKw.split(PostConstants.KEYWORD_SPLIT_REGEX);
                for (String part : split) {
                    String clean = NullSafeUtils.safeTrim(part);
                    if (!clean.isEmpty()) {
                        seen.add(clean);
                    }
                }
            }
        }

        return seen.stream().limit(15).toList();
    }

    @Override
    public List<PostSummaryResponse> getHomeFeatured() {
        List<PostEntity> featured = postRepository.findFeaturedPosts(PageRequest.of(0, 4));
        return mapToSummaryList(featured, true);
    }

    @Override
    public List<PostSummaryResponse> getEditorPicks() {
        List<PostEntity> picks = postRepository.findRecentPosts(PageRequest.of(0, 6));
        return mapToSummaryList(picks, true);
    }

    @Override
    public PageResponse<PostSummaryResponse> getPublicPosts(PostPublicQueryCriteria criteria) {
        Pageable pageable = criteria.pageable();

        final Set<Long> targetCategoryIds = new HashSet<>();
        if (criteria.categoryId() != null) {
            targetCategoryIds.add(criteria.categoryId());
        }
        if (!CollectionUtils.isEmpty(criteria.categoryIds())) {
            targetCategoryIds.addAll(criteria.categoryIds());
        }

        List<String> requestedCats = criteria.resolvedCategories();
        if (!requestedCats.isEmpty()) {
            List<String> cleanCats = requestedCats.stream()
                    .map(NullSafeUtils::safeLowerTrim)
                    .filter(c -> !c.isEmpty() && !PostConstants.FILTER_ALL.equalsIgnoreCase(c))
                    .toList();
            if (!cleanCats.isEmpty()) {
                List<CategoryEntity> matchingCats = categoryRepository.findBySlugInAndIsDeletedFalse(cleanCats);
                Set<Long> activeCatIds = matchingCats.stream()
                        .filter(c -> NullSafeUtils.safeBoolean(c.getIsActive()))
                        .map(CategoryEntity::getId)
                        .collect(Collectors.toSet());
                if (activeCatIds.isEmpty()) {
                    return PageResponse.of(Collections.emptyList(), pageable.getPageNumber(), pageable.getPageSize(), 0L);
                }
                targetCategoryIds.addAll(activeCatIds);
            }
        }

        Long resolvedStoreId = null;
        String storeSlug = NullSafeUtils.safeLowerTrim(criteria.storeSlug());
        if (!storeSlug.isEmpty() && !PostConstants.FILTER_ALL.equalsIgnoreCase(storeSlug)) {
            Optional<StoreEntity> storeOpt = storeRepository.findBySlugAndIsDeletedFalse(storeSlug);
            if (storeOpt.isEmpty() || !NullSafeUtils.safeBoolean(storeOpt.get().getIsActive())) {
                return PageResponse.of(Collections.emptyList(), pageable.getPageNumber(), pageable.getPageSize(), 0L);
            }
            resolvedStoreId = storeOpt.get().getId();
        }

        final Long targetStoreId = resolvedStoreId;
        final String cleanSearch = NullSafeUtils.safeLowerTrim(criteria.search());
        final Boolean featuredFilter = criteria.featured();

        final List<String> rawRequestedTags = criteria.resolvedTags();
        final List<String> cleanTagItems = new ArrayList<>();
        for (String rt : rawRequestedTags) {
            String c = NullSafeUtils.safeLowerTrim(rt).replaceAll(PostConstants.LEADING_HASH_REGEX, AppConstants.EMPTY);
            if (!c.isEmpty() && !PostConstants.FILTER_ALL.equalsIgnoreCase(c)) {
                cleanTagItems.add(c);
            }
        }

        final Set<Long> postIdsMatchingTags = new HashSet<>();
        final Set<String> tagTextPatterns = new LinkedHashSet<>(cleanTagItems);

        if (!cleanTagItems.isEmpty()) {
            List<com.heygoodly.portal.modules.tag.entity.TagEntity> matchingTagEntities = tagRepository.findBySlugInOrNameIn(cleanTagItems);
            if (!matchingTagEntities.isEmpty()) {
                List<Long> matchedTagIds = matchingTagEntities.stream().map(com.heygoodly.portal.modules.tag.entity.TagEntity::getId).toList();
                List<Long> entityTagPostIds = entityTagRepository.findEntityIdsByTagIdInAndEntityType(matchedTagIds, EntityFieldConstants.TYPE_POST);
                if (!entityTagPostIds.isEmpty()) {
                    postIdsMatchingTags.addAll(entityTagPostIds);
                }
                for (com.heygoodly.portal.modules.tag.entity.TagEntity te : matchingTagEntities) {
                    if (org.springframework.util.StringUtils.hasText(te.getSlug())) {
                        tagTextPatterns.add(te.getSlug().toLowerCase());
                    }
                    if (org.springframework.util.StringUtils.hasText(te.getName())) {
                        tagTextPatterns.add(te.getName().toLowerCase());
                    }
                }
            }
        }

        Specification<PostEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get(PostConstants.FIELD_IS_DELETED)));
            predicates.add(cb.isTrue(root.get(PostConstants.FIELD_IS_ACTIVE)));
            predicates.add(cb.lessThanOrEqualTo(root.get(PostConstants.FIELD_PUBLISHED_AT), Instant.now()));

            if (query != null) {
                jakarta.persistence.criteria.Subquery<Long> activeCatSub = query.subquery(Long.class);
                jakarta.persistence.criteria.Root<CategoryEntity> catRoot = activeCatSub.from(CategoryEntity.class);
                activeCatSub.select(catRoot.get(PostConstants.FIELD_ID))
                        .where(
                                cb.equal(catRoot.get(PostConstants.FIELD_ID), root.get(PostConstants.FIELD_CATEGORY_ID)),
                                cb.isTrue(catRoot.get(PostConstants.FIELD_IS_ACTIVE)),
                                cb.isFalse(catRoot.get(PostConstants.FIELD_IS_DELETED))
                        );
                predicates.add(cb.or(
                        cb.isNull(root.get(PostConstants.FIELD_CATEGORY_ID)),
                        cb.exists(activeCatSub)
                ));
            }

            if (!targetCategoryIds.isEmpty()) {
                if (targetCategoryIds.size() == 1) {
                    predicates.add(cb.equal(root.get(PostConstants.FIELD_CATEGORY_ID), targetCategoryIds.iterator().next()));
                } else {
                    predicates.add(root.get(PostConstants.FIELD_CATEGORY_ID).in(targetCategoryIds));
                }
            }

            if (targetStoreId != null) {
                predicates.add(cb.equal(root.get(PostConstants.FIELD_STORE_ID), targetStoreId));
            }

            if (featuredFilter != null) {
                predicates.add(cb.equal(root.get(PostConstants.FIELD_IS_FEATURED), featuredFilter));
            }

            if (!cleanSearch.isEmpty()) {
                String pattern = new StringBuilder()
                        .append(AppConstants.PERCENT)
                        .append(cleanSearch)
                        .append(AppConstants.PERCENT)
                        .toString();
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get(PostConstants.FIELD_TITLE)), pattern),
                        cb.like(cb.lower(root.get(PostConstants.FIELD_SLUG)), pattern),
                        cb.like(cb.lower(cb.coalesce(root.get(PostConstants.FIELD_META_KEYWORDS), AppConstants.EMPTY)), pattern),
                        cb.like(cb.lower(cb.coalesce(root.get(PostConstants.FIELD_TAGS).as(String.class), AppConstants.EMPTY)), pattern),
                        cb.like(cb.lower(cb.coalesce(root.get(PostConstants.FIELD_EXCERPT), AppConstants.EMPTY)), pattern)
                ));
            }

            if (!cleanTagItems.isEmpty()) {
                List<Predicate> tagPredicates = new ArrayList<>();
                if (!postIdsMatchingTags.isEmpty()) {
                    tagPredicates.add(root.get(PostConstants.FIELD_ID).in(postIdsMatchingTags));
                }
                for (String patternStr : tagTextPatterns) {
                    String tagPattern = new StringBuilder()
                            .append(AppConstants.PERCENT)
                            .append(patternStr)
                            .append(AppConstants.PERCENT)
                            .toString();
                    tagPredicates.add(cb.or(
                            cb.like(cb.lower(cb.coalesce(root.get(PostConstants.FIELD_META_KEYWORDS), AppConstants.EMPTY)), tagPattern),
                            cb.like(cb.lower(cb.coalesce(root.get(PostConstants.FIELD_TAGS).as(String.class), AppConstants.EMPTY)), tagPattern),
                            cb.like(cb.lower(root.get(PostConstants.FIELD_SLUG)), tagPattern)
                    ));
                }
                if (!tagPredicates.isEmpty()) {
                    predicates.add(cb.or(tagPredicates.toArray(new Predicate[0])));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<PostEntity> page = postRepository.findAll(spec, pageable);
        List<PostSummaryResponse> summaries = mapToSummaryList(page.getContent(), true);
        return PageResponse.of(summaries, page.getNumber(), page.getSize(), page.getTotalElements());
    }

    @Override
    @Transactional
    public PostDetailResponse getPostBySlug(String slug) {
        String cleanSlug = NullSafeUtils.safeTrim(slug);
        PostEntity post = postRepository.findBySlugAndIsDeletedFalse(cleanSlug)
                .orElseThrow(() -> new ResourceNotFoundException(PostConstants.ENTITY_POST, PostConstants.FIELD_SLUG, cleanSlug));

        boolean isStaff = SecurityUtils.isStaffOrAdmin();
        if (!isStaff) {
            if (!NullSafeUtils.safeBoolean(post.getIsActive()) || (post.getPublishedAt() != null && post.getPublishedAt().isAfter(Instant.now()))) {
                throw new ResourceNotFoundException(PostConstants.ENTITY_POST, PostConstants.FIELD_SLUG, cleanSlug);
            }
            if (post.getCategoryId() != null) {
                boolean categoryActive = categoryRepository.findById(post.getCategoryId())
                        .map(c -> !NullSafeUtils.safeBoolean(c.getIsDeleted()) && NullSafeUtils.safeBoolean(c.getIsActive()))
                        .orElse(false);
                if (!categoryActive) {
                    throw new ResourceNotFoundException(PostConstants.ENTITY_POST, PostConstants.FIELD_SLUG, cleanSlug);
                }
            }
        }

        postRepository.incrementViewCount(post.getId());
        return mapToDetail(post, !isStaff);
    }

    @Override
    public PageResponse<PostSummaryResponse> getAdminPosts(PostAdminQueryCriteria criteria) {
        Pageable pageable = criteria.pageable();
        final Long categoryId = criteria.categoryId();
        final Boolean featured = criteria.featured();
        final Boolean active = criteria.active();
        final String cleanSearch = NullSafeUtils.safeLowerTrim(criteria.search());
        final String cleanTag = NullSafeUtils.safeLowerTrim(criteria.tag()).replaceAll(PostConstants.LEADING_HASH_REGEX, AppConstants.EMPTY);
        final String cleanStatus = NullSafeUtils.safeTrim(criteria.status()).toUpperCase();

        Specification<PostEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get(PostConstants.FIELD_IS_DELETED)));

            if (categoryId != null) {
                predicates.add(cb.equal(root.get(PostConstants.FIELD_CATEGORY_ID), categoryId));
            }

            if (featured != null) {
                predicates.add(cb.equal(root.get(PostConstants.FIELD_IS_FEATURED), featured));
            }

            if (!cleanSearch.isEmpty()) {
                String pattern = new StringBuilder()
                        .append(AppConstants.PERCENT)
                        .append(cleanSearch)
                        .append(AppConstants.PERCENT)
                        .toString();
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get(PostConstants.FIELD_TITLE)), pattern),
                        cb.like(cb.lower(root.get(PostConstants.FIELD_SLUG)), pattern),
                        cb.like(cb.lower(cb.coalesce(root.get(PostConstants.FIELD_META_KEYWORDS), AppConstants.EMPTY)), pattern),
                        cb.like(cb.lower(cb.coalesce(root.get(PostConstants.FIELD_TAGS).as(String.class), AppConstants.EMPTY)), pattern),
                        cb.like(cb.lower(cb.coalesce(root.get(PostConstants.FIELD_EXCERPT), AppConstants.EMPTY)), pattern)
                ));
            }

            if (!cleanTag.isEmpty() && !PostConstants.FILTER_ALL.equalsIgnoreCase(cleanTag)) {
                String[] tagItems = cleanTag.split(AppConstants.COMMA);
                List<Predicate> tagPredicates = new ArrayList<>();
                for (String tagItem : tagItems) {
                    String singleClean = NullSafeUtils.safeLowerTrim(tagItem).replaceAll(PostConstants.LEADING_HASH_REGEX, AppConstants.EMPTY);
                    if (!singleClean.isEmpty() && !PostConstants.FILTER_ALL.equalsIgnoreCase(singleClean)) {
                        String tagPattern = new StringBuilder()
                                .append(AppConstants.PERCENT)
                                .append(singleClean)
                                .append(AppConstants.PERCENT)
                                .toString();
                        tagPredicates.add(cb.or(
                                cb.like(cb.lower(cb.coalesce(root.get(PostConstants.FIELD_META_KEYWORDS), AppConstants.EMPTY)), tagPattern),
                                cb.like(cb.lower(cb.coalesce(root.get(PostConstants.FIELD_TAGS).as(String.class), AppConstants.EMPTY)), tagPattern),
                                cb.like(cb.lower(root.get(PostConstants.FIELD_SLUG)), tagPattern)
                        ));
                    }
                }
                if (!tagPredicates.isEmpty()) {
                    predicates.add(cb.or(tagPredicates.toArray(new Predicate[0])));
                }
            }

            if (!cleanStatus.isEmpty() && !PostConstants.FILTER_ALL.equalsIgnoreCase(cleanStatus)) {
                if (PostStatus.PUBLISHED.name().equals(cleanStatus)) {
                    predicates.add(cb.isTrue(root.get(PostConstants.FIELD_IS_ACTIVE)));
                    predicates.add(cb.lessThanOrEqualTo(root.get(PostConstants.FIELD_PUBLISHED_AT), Instant.now()));
                } else if (PostStatus.SCHEDULED.name().equals(cleanStatus)) {
                    predicates.add(cb.isTrue(root.get(PostConstants.FIELD_IS_ACTIVE)));
                    predicates.add(cb.greaterThan(root.get(PostConstants.FIELD_PUBLISHED_AT), Instant.now()));
                } else if (PostStatus.DRAFT.name().equals(cleanStatus)) {
                    predicates.add(cb.isFalse(root.get(PostConstants.FIELD_IS_ACTIVE)));
                }
            } else if (active != null) {
                predicates.add(cb.equal(root.get(PostConstants.FIELD_IS_ACTIVE), active));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<PostEntity> page = postRepository.findAll(spec, pageable);
        List<PostSummaryResponse> summaries = mapToSummaryList(page.getContent());
        return PageResponse.of(summaries, page.getNumber(), page.getSize(), page.getTotalElements());
    }

    @Override
    public PostStatsResponse getPostStats() {
        long total = postRepository.countByIsDeletedFalse();
        long published = postRepository.countPublishedPosts();
        long scheduled = postRepository.countScheduledPosts();
        long draft = postRepository.countDraftPosts();
        long totalViews = postRepository.sumTotalViews();
        return new PostStatsResponse(total, published, scheduled, draft, totalViews);
    }

    @Override
    public PostDetailResponse getById(Long id) {
        return postRepository.findById(id)
                .filter(p -> !NullSafeUtils.safeBoolean(p.getIsDeleted()))
                .map(this::mapToDetail)
                .orElseThrow(() -> new ResourceNotFoundException(PostConstants.ENTITY_POST, PostConstants.FIELD_ID, id));
    }

    @Override
    @Transactional
    public PostDetailResponse create(PostRequest request) {
        String rawSlug = NullSafeUtils.safeTrim(request.getSlug());
        String slug = !rawSlug.isEmpty()
                ? SlugUtils.toSlug(rawSlug)
                : SlugUtils.toSlug(request.getTitle());

        if (postRepository.existsBySlugAndIsDeletedFalse(slug)) {
            throw new DuplicateResourceException(PostConstants.ENTITY_POST, PostConstants.FIELD_SLUG, slug);
        }

        if (request.getCategoryId() != null && !categoryRepository.existsById(request.getCategoryId())) {
            throw new ResourceNotFoundException(PostConstants.ENTITY_CATEGORY, PostConstants.FIELD_ID, request.getCategoryId());
        }

        Long resolvedStoreId = resolveStoreId(request.getStoreId(), request.getStoreSlug());
        Long authorId = SecurityUtils.getCurrentUserId().orElse(null);

        Instant now = Instant.now();
        boolean isActive = true;
        Instant publishedAt = request.getPublishedAt() != null ? request.getPublishedAt() : now;
        String resolvedStatus = PostStatus.PUBLISHED.name();

        String reqStatus = NullSafeUtils.safeTrim(request.getStatus()).toUpperCase();
        if (!reqStatus.isEmpty()) {
            if (PostStatus.DRAFT.name().equals(reqStatus)) {
                isActive = false;
                resolvedStatus = PostStatus.DRAFT.name();
            } else if (PostStatus.SCHEDULED.name().equals(reqStatus)) {
                isActive = true;
                resolvedStatus = PostStatus.SCHEDULED.name();
                if (request.getPublishedAt() == null || !request.getPublishedAt().isAfter(now)) {
                    publishedAt = now.plus(1, ChronoUnit.DAYS);
                } else {
                    publishedAt = request.getPublishedAt();
                }
            } else {
                isActive = true;
                resolvedStatus = PostStatus.PUBLISHED.name();
                publishedAt = request.getPublishedAt() != null && !request.getPublishedAt().isAfter(now)
                        ? request.getPublishedAt()
                        : now;
            }
        } else {
            if (request.getIsActive() != null) {
                isActive = request.getIsActive();
            }
            if (request.getPublishedAt() != null) {
                publishedAt = request.getPublishedAt();
            }
            resolvedStatus = isActive
                    ? (publishedAt.isAfter(now) ? PostStatus.SCHEDULED.name() : PostStatus.PUBLISHED.name())
                    : PostStatus.DRAFT.name();
        }

        List<String> normalizedTags = normalizeTagsInput(request.getTags(), request.getMetaKeywords());
        String tagsJson = normalizedTags.isEmpty() ? null : serializeJson(normalizedTags);
        String sidebarJson = request.getSidebarConfig() != null ? serializeJson(request.getSidebarConfig()) : null;
        String readTime = NullSafeUtils.trimToNull(request.getReadTime());
        if (readTime == null) {
            readTime = estimateReadTime(request.getContent());
        }

        PostEntity post = PostEntity.builder()
                .title(NullSafeUtils.safeTrim(request.getTitle()))
                .slug(slug)
                .categoryId(request.getCategoryId())
                .authorId(authorId)
                .storeId(resolvedStoreId)
                .image(NullSafeUtils.trimToNull(request.getImage()))
                .excerpt(NullSafeUtils.trimToNull(request.getExcerpt()))
                .content(request.getContent())
                .readTime(readTime)
                .rating(request.getRating())
                .status(resolvedStatus)
                .tags(tagsJson)
                .sidebarConfig(sidebarJson)
                .isFeatured(NullSafeUtils.safeBoolean(request.getIsFeatured()))
                .isActive(isActive)
                .sortOrder(NullSafeUtils.safeInt(request.getSortOrder(), AppConstants.DEFAULT_SORT_ORDER))
                .publishedAt(publishedAt)
                .metaTitle(NullSafeUtils.trimToNull(request.getMetaTitle()))
                .metaKeywords(NullSafeUtils.trimToNull(request.getMetaKeywords()))
                .metaDescription(NullSafeUtils.trimToNull(request.getMetaDescription()))
                .canonicalUrl(NullSafeUtils.trimToNull(request.getCanonicalUrl()))
                .build();

        post.setCreatedBy(SecurityUtils.getCurrentUserEmail().orElse(AppConstants.SYSTEM_USER));
        PostEntity saved = postRepository.save(post);

        if (!normalizedTags.isEmpty()) {
            tagService.syncEntityTags(EntityFieldConstants.TYPE_POST, saved.getId(), normalizedTags);
        }

        return mapToDetail(saved);
    }

    @Override
    @Transactional
    public PostDetailResponse update(Long id, PostRequest request) {
        PostEntity post = postRepository.findById(id)
                .filter(p -> !NullSafeUtils.safeBoolean(p.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException(PostConstants.ENTITY_POST, PostConstants.FIELD_ID, id));

        String rawSlug = NullSafeUtils.safeTrim(request.getSlug());
        String slug = !rawSlug.isEmpty()
                ? SlugUtils.toSlug(rawSlug)
                : SlugUtils.toSlug(request.getTitle());

        if (postRepository.existsBySlugAndIdNotAndIsDeletedFalse(slug, id)) {
            throw new DuplicateResourceException(PostConstants.ENTITY_POST, PostConstants.FIELD_SLUG, slug);
        }

        if (request.getCategoryId() != null && !categoryRepository.existsById(request.getCategoryId())) {
            throw new ResourceNotFoundException(PostConstants.ENTITY_CATEGORY, PostConstants.FIELD_ID, request.getCategoryId());
        }

        post.setTitle(NullSafeUtils.safeTrim(request.getTitle()));
        post.setSlug(slug);
        post.setCategoryId(request.getCategoryId());

        if (request.getStoreId() != null || request.getStoreSlug() != null) {
            post.setStoreId(resolveStoreId(request.getStoreId(), request.getStoreSlug()));
        }

        post.setImage(NullSafeUtils.trimToNull(request.getImage()));
        post.setExcerpt(NullSafeUtils.trimToNull(request.getExcerpt()));
        post.setContent(request.getContent());

        String reqReadTime = NullSafeUtils.trimToNull(request.getReadTime());
        if (reqReadTime != null) {
            post.setReadTime(reqReadTime);
        } else if (NullSafeUtils.safeTrim(post.getReadTime()).isEmpty()) {
            post.setReadTime(estimateReadTime(request.getContent()));
        }

        if (request.getRating() != null) {
            post.setRating(request.getRating());
        }
        if (request.getIsFeatured() != null) {
            post.setIsFeatured(request.getIsFeatured());
        }
        if (request.getSortOrder() != null) {
            post.setSortOrder(request.getSortOrder());
        }

        Instant now = Instant.now();
        String reqStatus = NullSafeUtils.safeTrim(request.getStatus()).toUpperCase();
        if (!reqStatus.isEmpty()) {
            if (PostStatus.DRAFT.name().equals(reqStatus)) {
                post.setIsActive(false);
                post.setStatus(PostStatus.DRAFT.name());
            } else if (PostStatus.SCHEDULED.name().equals(reqStatus)) {
                post.setIsActive(true);
                post.setStatus(PostStatus.SCHEDULED.name());
                if (request.getPublishedAt() != null && request.getPublishedAt().isAfter(now)) {
                    post.setPublishedAt(request.getPublishedAt());
                } else if (post.getPublishedAt() == null || !post.getPublishedAt().isAfter(now)) {
                    post.setPublishedAt(now.plus(1, ChronoUnit.DAYS));
                }
            } else {
                post.setIsActive(true);
                post.setStatus(PostStatus.PUBLISHED.name());
                post.setPublishedAt(request.getPublishedAt() != null && !request.getPublishedAt().isAfter(now)
                        ? request.getPublishedAt()
                        : now);
            }
        } else {
            if (request.getIsActive() != null) {
                post.setIsActive(request.getIsActive());
            }
            if (request.getPublishedAt() != null) {
                post.setPublishedAt(request.getPublishedAt());
            }
            post.setStatus(computeStatus(post));
        }

        if (request.getTags() != null || request.getMetaKeywords() != null) {
            List<String> normalizedTags = normalizeTagsInput(request.getTags(), request.getMetaKeywords());
            post.setTags(normalizedTags.isEmpty() ? null : serializeJson(normalizedTags));
            tagService.syncEntityTags(EntityFieldConstants.TYPE_POST, post.getId(), normalizedTags);
        }
        if (request.getSidebarConfig() != null) {
            post.setSidebarConfig(serializeJson(request.getSidebarConfig()));
        }

        post.setMetaTitle(NullSafeUtils.trimToNull(request.getMetaTitle()));
        post.setMetaKeywords(NullSafeUtils.trimToNull(request.getMetaKeywords()));
        post.setMetaDescription(NullSafeUtils.trimToNull(request.getMetaDescription()));
        if (request.getCanonicalUrl() != null) {
            post.setCanonicalUrl(NullSafeUtils.trimToNull(request.getCanonicalUrl()));
        }

        PostEntity updated = postRepository.save(post);
        return mapToDetail(updated);
    }

    @Override
    @Transactional
    public PostDetailResponse clonePost(Long id) {
        PostEntity source = postRepository.findById(id)
                .filter(p -> !NullSafeUtils.safeBoolean(p.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException(PostConstants.ENTITY_POST, PostConstants.FIELD_ID, id));

        String cloneTitle = new StringBuilder()
                .append(source.getTitle())
                .append(PostConstants.COPY_SUFFIX)
                .toString();
        String cloneSlug = new StringBuilder()
                .append(SlugUtils.toSlug(cloneTitle))
                .append(AppConstants.HYPHEN)
                .append(System.currentTimeMillis())
                .toString();

        PostEntity clone = PostEntity.builder()
                .title(cloneTitle)
                .slug(cloneSlug)
                .categoryId(source.getCategoryId())
                .authorId(source.getAuthorId())
                .storeId(source.getStoreId())
                .image(source.getImage())
                .excerpt(source.getExcerpt())
                .content(source.getContent())
                .readTime(source.getReadTime())
                .rating(source.getRating())
                .status(PostStatus.DRAFT.name())
                .tags(source.getTags())
                .sidebarConfig(source.getSidebarConfig())
                .isFeatured(false)
                .isActive(false)
                .sortOrder(source.getSortOrder())
                .publishedAt(Instant.now())
                .metaTitle(source.getMetaTitle())
                .metaKeywords(source.getMetaKeywords())
                .metaDescription(source.getMetaDescription())
                .canonicalUrl(source.getCanonicalUrl())
                .build();

        clone.setCreatedBy(SecurityUtils.getCurrentUserEmail().orElse(AppConstants.SYSTEM_USER));
        PostEntity saved = postRepository.save(clone);
        return mapToDetail(saved);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        PostEntity post = postRepository.findById(id)
                .filter(p -> !NullSafeUtils.safeBoolean(p.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException(PostConstants.ENTITY_POST, PostConstants.FIELD_ID, id));

        post.setIsDeleted(true);
        post.setSlug(new StringBuilder()
                .append(post.getSlug())
                .append(AppConstants.HYPHEN)
                .append(PostConstants.DELETED_SEGMENT)
                .append(AppConstants.HYPHEN)
                .append(System.currentTimeMillis())
                .toString());
        postRepository.save(post);
    }

    private Long resolveStoreId(Long storeId, String storeSlug) {
        if (storeId != null && storeId > 0) {
            return storeRepository.findById(storeId)
                    .filter(s -> !NullSafeUtils.safeBoolean(s.getIsDeleted()))
                    .map(StoreEntity::getId)
                    .orElse(null);
        }
        String cleanStoreSlug = NullSafeUtils.safeLowerTrim(storeSlug);
        if (!cleanStoreSlug.isEmpty()) {
            return storeRepository.findBySlugAndIsDeletedFalse(cleanStoreSlug)
                    .map(StoreEntity::getId)
                    .orElse(null);
        }
        return null;
    }

    private String computeStatus(PostEntity p) {
        if (!NullSafeUtils.safeBoolean(p.getIsActive())) {
            return PostStatus.DRAFT.name();
        }
        if (p.getPublishedAt() != null && p.getPublishedAt().isAfter(Instant.now())) {
            return PostStatus.SCHEDULED.name();
        }
        return PostStatus.PUBLISHED.name();
    }

    private List<PostSummaryResponse> mapToSummaryList(List<PostEntity> posts) {
        return mapToSummaryList(posts, false);
    }

    /**
     * Batch maps PostEntity list -> PostSummaryResponse list with ZERO N+1 queries.
     */
    private List<PostSummaryResponse> mapToSummaryList(List<PostEntity> posts, boolean publicOnly) {
        if (posts == null || posts.isEmpty()) {
            return Collections.emptyList();
        }

        Set<Long> categoryIds = posts.stream()
                .map(PostEntity::getCategoryId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Set<Long> authorIds = posts.stream()
                .map(PostEntity::getAuthorId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Set<Long> storeIds = posts.stream()
                .map(PostEntity::getStoreId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, CategoryEntity> categoryMap = categoryIds.isEmpty()
                ? Collections.emptyMap()
                : categoryRepository.findAllById(categoryIds).stream()
                        .filter(c -> !NullSafeUtils.safeBoolean(c.getIsDeleted()))
                        .collect(Collectors.toMap(CategoryEntity::getId, c -> c, (a, b) -> a));

        Map<Long, UserEntity> authorMap = authorIds.isEmpty()
                ? Collections.emptyMap()
                : userRepository.findAllById(authorIds).stream()
                        .filter(u -> !NullSafeUtils.safeBoolean(u.getIsDeleted()))
                        .collect(Collectors.toMap(UserEntity::getId, u -> u, (a, b) -> a));

        Map<Long, StoreEntity> storeMap = storeIds.isEmpty()
                ? Collections.emptyMap()
                : storeRepository.findAllById(storeIds).stream()
                        .filter(s -> !NullSafeUtils.safeBoolean(s.getIsDeleted()))
                        .filter(s -> !publicOnly || NullSafeUtils.safeBoolean(s.getIsActive()))
                        .collect(Collectors.toMap(StoreEntity::getId, s -> s, (a, b) -> a));

        return posts.stream().map(p -> {
            CategoryEntity cat = p.getCategoryId() != null ? categoryMap.get(p.getCategoryId()) : null;
            UserEntity author = p.getAuthorId() != null ? authorMap.get(p.getAuthorId()) : null;
            StoreEntity store = p.getStoreId() != null ? storeMap.get(p.getStoreId()) : null;
            return postMapper.toSummaryResponse(p, cat, author, store, publicOnly);
        }).toList();
    }

    private PostDetailResponse mapToDetail(PostEntity p) {
        return mapToDetail(p, false);
    }

    private PostDetailResponse mapToDetail(PostEntity p, boolean publicOnly) {
        CategoryEntity cat = p.getCategoryId() != null
                ? categoryRepository.findById(p.getCategoryId())
                        .filter(c -> !NullSafeUtils.safeBoolean(c.getIsDeleted()))
                        .orElse(null)
                : null;

        UserEntity author = p.getAuthorId() != null
                ? userRepository.findById(p.getAuthorId())
                        .filter(u -> !NullSafeUtils.safeBoolean(u.getIsDeleted()))
                        .orElse(null)
                : null;

        StoreEntity store = p.getStoreId() != null
                ? storeRepository.findById(p.getStoreId())
                        .filter(s -> !NullSafeUtils.safeBoolean(s.getIsDeleted()))
                        .filter(s -> !publicOnly || NullSafeUtils.safeBoolean(s.getIsActive()))
                        .orElse(null)
                : null;

        return postMapper.toDetailResponse(p, cat, author, store);
    }

    private String estimateReadTime(String content) {
        String plain = NullSafeUtils.safeTrim(content)
                .replaceAll(PostConstants.HTML_TAG_REGEX, AppConstants.SPACE)
                .trim();
        if (plain.isEmpty()) {
            return PostConstants.DEFAULT_READ_TIME;
        }
        int wordCount = plain.split(PostConstants.WHITESPACE_REGEX).length;
        int minutes = Math.max(1, (int) Math.ceil(wordCount / 200.0));
        return new StringBuilder()
                .append(minutes)
                .append(PostConstants.MIN_READ_SUFFIX)
                .toString();
    }

    private List<String> normalizeTagsInput(List<String> tags, String metaKeywords) {
        Set<String> result = new LinkedHashSet<>();
        if (tags != null) {
            for (String item : tags) {
                String clean = NullSafeUtils.safeTrim(item);
                if (!clean.isEmpty()) {
                    result.add(clean);
                }
            }
        }
        if (result.isEmpty()) {
            String trimmedKw = NullSafeUtils.safeTrim(metaKeywords);
            if (!trimmedKw.isEmpty()) {
                for (String part : trimmedKw.split(PostConstants.KEYWORD_SPLIT_REGEX)) {
                    String clean = NullSafeUtils.safeTrim(part);
                    if (!clean.isEmpty()) {
                        result.add(clean);
                    }
                }
            }
        }
        return new ArrayList<>(result);
    }

    private List<String> extractTags(String tagsJson, String metaKeywords) {
        List<String> fromJson = parseTagsJson(tagsJson);
        if (!fromJson.isEmpty()) {
            return fromJson;
        }
        String trimmedKw = NullSafeUtils.safeTrim(metaKeywords);
        if (trimmedKw.isEmpty()) {
            return Collections.emptyList();
        }
        List<String> list = new ArrayList<>();
        for (String part : trimmedKw.split(PostConstants.KEYWORD_SPLIT_REGEX)) {
            String clean = NullSafeUtils.safeTrim(part);
            if (!clean.isEmpty()) {
                list.add(clean);
            }
        }
        return list;
    }

    private List<String> parseTagsJson(String json) {
        String trimmed = NullSafeUtils.safeTrim(json);
        if (trimmed.isEmpty()) {
            return Collections.emptyList();
        }
        try {
            List<String> parsed = objectMapper.readValue(trimmed, new TypeReference<List<String>>() {});
            return NullSafeUtils.safeList(parsed);
        } catch (Exception ex) {
            log.debug("Unable to parse post tags JSON: {}", ex.getMessage());
            return Collections.emptyList();
        }
    }

    private Map<String, Object> parseSidebarJson(String json) {
        String trimmed = NullSafeUtils.safeTrim(json);
        if (trimmed.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(trimmed, new TypeReference<Map<String, Object>>() {});
        } catch (Exception ex) {
            log.debug("Unable to parse post sidebarConfig JSON: {}", ex.getMessage());
            return null;
        }
    }

    private String serializeJson(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception ex) {
            log.warn("Unable to serialize post JSON field: {}", ex.getMessage());
            return null;
        }
    }
}
