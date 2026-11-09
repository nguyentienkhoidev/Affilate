package com.heygoodly.portal.modules.tag.controller;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.constant.EntityFieldConstants;
import com.heygoodly.portal.common.constant.MessageConstants;
import com.heygoodly.portal.common.constant.PermissionConstants;
import com.heygoodly.portal.common.dto.ApiResponse;
import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.common.util.PaginationUtils;
import com.heygoodly.portal.common.util.SecurityUtils;
import com.heygoodly.portal.modules.role.enums.RoleCode;
import com.heygoodly.portal.modules.tag.dto.TagRequest;
import com.heygoodly.portal.modules.tag.dto.TagResponse;
import com.heygoodly.portal.modules.tag.dto.request.TagAdminQueryCriteria;
import com.heygoodly.portal.modules.tag.service.TagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/tags")
@RequiredArgsConstructor
public class TagAdminController {

    private final TagService tagService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<TagResponse>>> list(@ModelAttribute TagAdminQueryCriteria criteria) {
        Pageable pageable = criteria.toPageable();
        PageResponse<TagResponse> response = tagService.getTags(criteria.getSearch(), criteria.getIsFeatured(), criteria.getEntityType(), pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/featured")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<TagResponse>>> getFeatured() {
        List<TagResponse> response = tagService.getFeaturedTags();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<TagResponse>> getById(@PathVariable("id") Long id) {
        TagResponse response = tagService.getTagById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.TAG_CREATE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<TagResponse>> create(@Valid @RequestBody TagRequest request) {
        String username = SecurityUtils.getCurrentUserEmail().orElse("system");
        TagResponse response = tagService.createTag(request, username);
        return ResponseEntity.ok(ApiResponse.created(MessageConstants.CREATED, response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.TAG_UPDATE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<TagResponse>> update(
            @PathVariable("id") Long id,
            @Valid @RequestBody TagRequest request
    ) {
        String username = SecurityUtils.getCurrentUserEmail().orElse("system");
        TagResponse response = tagService.updateTag(id, request, username);
        return ResponseEntity.ok(ApiResponse.ok(MessageConstants.UPDATED, response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.TAG_DELETE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable("id") Long id) {
        String username = SecurityUtils.getCurrentUserEmail().orElse("system");
        tagService.deleteTag(id, username);
        return ResponseEntity.ok(ApiResponse.ok(MessageConstants.DELETED, null));
    }
}

