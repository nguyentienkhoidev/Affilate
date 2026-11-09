package com.heygoodly.portal.modules.page.service;

import com.heygoodly.portal.modules.page.dto.request.PageRequest;
import com.heygoodly.portal.modules.page.dto.response.PageResponse;
import com.heygoodly.portal.modules.page.dto.response.PageSummaryResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PageService {
    List<PageSummaryResponse> getPublicPages();
    PageResponse getPublicPageBySlug(String slug);
    com.heygoodly.portal.common.dto.PageResponse<PageSummaryResponse> getPages(Pageable pageable, String search, Boolean isActive);
    PageResponse getPageById(Long id);
    PageResponse createPage(PageRequest request);
    PageResponse updatePage(Long id, PageRequest request);
    void deletePage(Long id);
}
