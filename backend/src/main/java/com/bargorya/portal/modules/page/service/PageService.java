package com.bargorya.portal.modules.page.service;

import com.bargorya.portal.modules.page.dto.request.PageRequest;
import com.bargorya.portal.modules.page.dto.response.PageResponse;
import com.bargorya.portal.modules.page.dto.response.PageSummaryResponse;
import org.springframework.data.domain.Pageable;

public interface PageService {
    PageResponse getPublicPageBySlug(String slug);
    com.bargorya.portal.common.dto.PageResponse<PageSummaryResponse> getPages(Pageable pageable, String search, Boolean isActive);
    PageResponse getPageById(Long id);
    PageResponse createPage(PageRequest request);
    PageResponse updatePage(Long id, PageRequest request);
    void deletePage(Long id);
}
