package com.heygoodly.portal.modules.search.service.impl;

import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.common.util.NullSafeUtils;
import com.heygoodly.portal.common.util.PaginationUtils;
import com.heygoodly.portal.modules.offer.dto.response.OfferResponse;
import com.heygoodly.portal.modules.offer.service.OfferService;
import com.heygoodly.portal.modules.post.dto.response.PostSummaryResponse;
import com.heygoodly.portal.modules.post.service.PostService;
import com.heygoodly.portal.modules.search.dto.response.SearchAggregateResponse;
import com.heygoodly.portal.modules.search.service.UniversalSearchService;
import com.heygoodly.portal.modules.store.dto.response.StoreSummaryResponse;
import com.heygoodly.portal.modules.store.service.StoreService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UniversalSearchServiceImpl implements UniversalSearchService {

    private final StoreService storeService;
    private final OfferService offerService;
    private final PostService postService;

    @Override
    @Transactional(readOnly = true)
    public SearchAggregateResponse searchAll(String query, Integer limit) {
        return searchAll(query, null, limit);
    }

    @Override
    @Transactional(readOnly = true)
    public SearchAggregateResponse searchAll(String query, String tag, Integer limit) {
        String cleanQuery = NullSafeUtils.safeTrim(query);
        String cleanTag = NullSafeUtils.safeTrim(tag).replaceAll("^#+", "");
        int fetchLimit = (limit == null || limit <= 0) ? 10 : Math.min(limit, 50);

        if (cleanQuery.isEmpty() && cleanTag.isEmpty()) {
            return SearchAggregateResponse.builder()
                    .query(cleanQuery)
                    .stores(Collections.emptyList())
                    .offers(Collections.emptyList())
                    .posts(Collections.emptyList())
                    .totalResults(0L)
                    .build();
        }

        Pageable storePageable = PaginationUtils.createPageable(0, fetchLimit, "sortOrder", "asc");
        Pageable offerPageable = PaginationUtils.createPageable(0, fetchLimit, "sortOrder", "asc");
        Pageable postPageable = PaginationUtils.createPageable(0, fetchLimit, "publishedAt", "desc");

        String effectiveSearch = cleanQuery.isEmpty() ? null : cleanQuery;
        String effectiveTag = cleanTag.isEmpty() ? null : cleanTag;

        PageResponse<StoreSummaryResponse> storesRes = storeService.getPublicStores(storePageable, effectiveSearch, null, null, null, effectiveTag);
        PageResponse<OfferResponse> offersRes = offerService.searchPublicOffers(offerPageable, effectiveSearch != null ? effectiveSearch : effectiveTag);
        PageResponse<PostSummaryResponse> postsRes = postService.getPublicPosts(postPageable, null, effectiveSearch, effectiveTag);

        List<StoreSummaryResponse> stores = NullSafeUtils.safeList(storesRes.content());
        List<OfferResponse> offers = NullSafeUtils.safeList(offersRes.content());
        List<PostSummaryResponse> posts = NullSafeUtils.safeList(postsRes.content());

        long total = storesRes.totalElements() + offersRes.totalElements() + postsRes.totalElements();

        return SearchAggregateResponse.builder()
                .query(cleanQuery.isEmpty() ? cleanTag : cleanQuery)
                .stores(stores)
                .offers(offers)
                .posts(posts)
                .totalResults(total)
                .build();
    }
}

