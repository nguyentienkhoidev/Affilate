package com.heygoodly.portal.modules.page.controller;

import com.heygoodly.portal.common.dto.ApiResponse;
import com.heygoodly.portal.modules.page.dto.response.PageResponse;
import com.heygoodly.portal.modules.page.dto.response.PageSummaryResponse;
import com.heygoodly.portal.modules.page.service.PageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/pages", "/api/v1/public/pages"})
@RequiredArgsConstructor
public class PagePublicController {

    private final PageService pageService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PageSummaryResponse>>> listPublicPages() {
        return ResponseEntity.ok(ApiResponse.success(pageService.getPublicPages()));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<PageResponse>> getBySlug(@PathVariable("slug") String slug) {
        return ResponseEntity.ok(ApiResponse.success(pageService.getPublicPageBySlug(slug)));
    }
}
