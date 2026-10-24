package com.bargorya.portal.modules.page.controller;

import com.bargorya.portal.common.constant.MessageConstants;
import com.bargorya.portal.common.constant.PermissionConstants;
import com.bargorya.portal.common.dto.ApiResponse;
import com.bargorya.portal.common.dto.PageResponse;
import com.bargorya.portal.common.util.PaginationUtils;
import com.bargorya.portal.modules.page.dto.request.PageRequest;
import com.bargorya.portal.modules.page.dto.response.PageSummaryResponse;
import com.bargorya.portal.modules.page.service.PageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/pages")
@RequiredArgsConstructor
public class PageAdminController {

    private final PageService pageService;

    @GetMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.PAGE_VIEW + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<PageSummaryResponse>>> list(
            @RequestParam(value = "page", required = false, defaultValue = "0") Integer page,
            @RequestParam(value = "size", required = false, defaultValue = "20") Integer size,
            @RequestParam(value = "sortBy", required = false, defaultValue = "sortOrder") String sortBy,
            @RequestParam(value = "direction", required = false, defaultValue = "asc") String direction,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "isActive", required = false) Boolean isActive
    ) {
        Pageable pageable = PaginationUtils.createPageable(page, size, sortBy, direction);
        PageResponse<PageSummaryResponse> result = pageService.getPages(pageable, search, isActive);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.PAGE_VIEW + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<com.bargorya.portal.modules.page.dto.response.PageResponse>> getById(
            @PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.success(pageService.getPageById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.PAGE_CREATE + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<com.bargorya.portal.modules.page.dto.response.PageResponse>> create(
            @Valid @RequestBody PageRequest request) {
        com.bargorya.portal.modules.page.dto.response.PageResponse created = pageService.createPage(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, MessageConstants.CREATED_SUCCESS));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.PAGE_UPDATE + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<com.bargorya.portal.modules.page.dto.response.PageResponse>> update(
            @PathVariable("id") Long id,
            @Valid @RequestBody PageRequest request) {
        com.bargorya.portal.modules.page.dto.response.PageResponse updated = pageService.updatePage(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, MessageConstants.UPDATED_SUCCESS));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.PAGE_DELETE + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable("id") Long id) {
        pageService.deletePage(id);
        return ResponseEntity.ok(ApiResponse.success(null, MessageConstants.DELETED_SUCCESS));
    }
}
