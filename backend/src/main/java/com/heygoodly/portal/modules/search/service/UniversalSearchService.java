package com.heygoodly.portal.modules.search.service;

import com.heygoodly.portal.modules.search.dto.response.SearchAggregateResponse;

public interface UniversalSearchService {
    SearchAggregateResponse searchAll(String query, Integer limit);
    SearchAggregateResponse searchAll(String query, String tag, Integer limit);
}

