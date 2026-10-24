package com.bargorya.portal.modules.page.controller;

import com.bargorya.portal.common.dto.ApiResponse;
import com.bargorya.portal.modules.page.dto.response.PageResponse;
import com.bargorya.portal.modules.page.service.PageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/pages")
@RequiredArgsConstructor
public class PagePublicController {

    private final PageService pageService;

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<PageResponse>> getBySlug(@PathVariable("slug") String slug) {
        return ResponseEntity.ok(ApiResponse.success(pageService.getPublicPageBySlug(slug)));
    }
}
