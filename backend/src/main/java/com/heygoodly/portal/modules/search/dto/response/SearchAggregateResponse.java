package com.heygoodly.portal.modules.search.dto.response;

import com.heygoodly.portal.modules.offer.dto.response.OfferResponse;
import com.heygoodly.portal.modules.post.dto.response.PostSummaryResponse;
import com.heygoodly.portal.modules.store.dto.response.StoreSummaryResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchAggregateResponse {
    private String query;
    private List<StoreSummaryResponse> stores;
    private List<OfferResponse> offers;
    private List<PostSummaryResponse> posts;
    private long totalResults;
}

