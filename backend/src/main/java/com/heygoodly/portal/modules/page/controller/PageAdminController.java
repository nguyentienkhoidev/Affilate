package com.heygoodly.portal.modules.page.controller;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.constant.EntityFieldConstants;
import com.heygoodly.portal.common.constant.MessageConstants;
import com.heygoodly.portal.common.constant.PermissionConstants;
import com.heygoodly.portal.common.dto.ApiResponse;
import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.common.util.PaginationUtils;
import com.heygoodly.portal.modules.page.dto.request.PageAdminQueryCriteria;
import com.heygoodly.portal.modules.page.dto.request.PageRequest;
import com.heygoodly.portal.modules.page.dto.response.PageSummaryResponse;
import com.heygoodly.portal.modules.page.service.PageService;
import com.heygoodly.portal.modules.role.enums.RoleCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
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
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<PageSummaryResponse>>> list(@ModelAttribute PageAdminQueryCriteria criteria) {
        Pageable pageable = criteria.toPageable();
        PageResponse<PageSummaryResponse> result = pageService.getPages(pageable, criteria.getSearch(), criteria.getIsActive());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<com.heygoodly.portal.modules.page.dto.response.PageResponse>> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.success(pageService.getPageById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.PAGE_CREATE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<com.heygoodly.portal.modules.page.dto.response.PageResponse>> create(@Valid @RequestBody PageRequest request) {
        com.heygoodly.portal.modules.page.dto.response.PageResponse created = pageService.createPage(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, MessageConstants.CREATED_SUCCESS));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.PAGE_UPDATE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<com.heygoodly.portal.modules.page.dto.response.PageResponse>> update(
            @PathVariable("id") Long id,
            @Valid @RequestBody PageRequest request) {
        com.heygoodly.portal.modules.page.dto.response.PageResponse updated = pageService.updatePage(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, MessageConstants.UPDATED_SUCCESS));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.PAGE_DELETE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable("id") Long id) {
        pageService.deletePage(id);
        return ResponseEntity.ok(ApiResponse.success(null, MessageConstants.DELETED_SUCCESS));
    }
}
