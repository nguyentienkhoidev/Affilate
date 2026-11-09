package com.heygoodly.portal.modules.search.controller;

import com.heygoodly.portal.common.dto.ApiResponse;
import com.heygoodly.portal.modules.search.dto.response.SearchAggregateResponse;
import com.heygoodly.portal.modules.search.service.UniversalSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/public/search", "/api/v1/search"})
@RequiredArgsConstructor
public class SearchPublicController {

    private final UniversalSearchService searchService;

    @GetMapping
    public ResponseEntity<ApiResponse<SearchAggregateResponse>> search(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "tag", required = false) String tag,
            @RequestParam(value = "limit", required = false, defaultValue = "10") Integer limit
    ) {
        SearchAggregateResponse response = searchService.searchAll(query, tag, limit);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
