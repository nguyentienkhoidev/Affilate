package com.heygoodly.portal.modules.media.controller;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.constant.EntityFieldConstants;
import com.heygoodly.portal.common.constant.MessageConstants;
import com.heygoodly.portal.common.constant.PermissionConstants;
import com.heygoodly.portal.common.dto.ApiResponse;
import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.common.exception.AppException;
import com.heygoodly.portal.common.exception.ErrorCode;
import com.heygoodly.portal.common.util.SecurityUtils;
import com.heygoodly.portal.modules.media.dto.request.MediaQueryCriteria;
import com.heygoodly.portal.modules.media.dto.request.UpdateMediaTagsRequest;
import com.heygoodly.portal.modules.media.dto.response.MediaItemResponse;
import com.heygoodly.portal.modules.media.service.MediaService;
import com.heygoodly.portal.modules.role.enums.RoleCode;
import lombok.RequiredArgsConstructor;
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
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/media")
@RequiredArgsConstructor
public class MediaAdminController {

    private final MediaService mediaService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<MediaItemResponse>>> getMedia(@ModelAttribute MediaQueryCriteria criteria) {
        if (criteria == null) {
            criteria = MediaQueryCriteria.builder().build();
        }
        PageResponse<MediaItemResponse> result = mediaService.getMediaItems(criteria);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/upload")
    @PreAuthorize("hasAuthority('" + PermissionConstants.FILE_UPLOAD + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<MediaItemResponse>> uploadMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", required = false, defaultValue = AppConstants.DEFAULT_MEDIA_CATEGORY) String category,
            @RequestParam(value = "tags", required = false) List<String> tags,
            @RequestParam(value = "dimensions", required = false) String dimensions
    ) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED));
        MediaItemResponse response = mediaService.uploadMedia(file, category, tags, dimensions, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok(MessageConstants.CREATED, response));
    }

    @PutMapping("/{id}/tags")
    @PreAuthorize("hasAuthority('" + PermissionConstants.FILE_UPLOAD + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<MediaItemResponse>> updateTags(
            @PathVariable Long id,
            @RequestBody UpdateMediaTagsRequest request
    ) {
        MediaItemResponse response = mediaService.updateTags(id, request.getTags());
        return ResponseEntity.ok(ApiResponse.ok(MessageConstants.UPDATED_SUCCESS, response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.FILE_DELETE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<Void>> deleteMedia(@PathVariable Long id) {
        mediaService.deleteMedia(id);
        return ResponseEntity.ok(ApiResponse.ok(MessageConstants.DELETED, null));
    }

    @GetMapping("/tags")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<String>>> getAllTags() {
        List<String> tags = mediaService.getAllUniqueTags();
        return ResponseEntity.ok(ApiResponse.ok(tags));
    }

    @GetMapping("/tags/counts")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<java.util.Map<String, Long>>> getTagCounts() {
        java.util.Map<String, Long> tagCounts = mediaService.getTagCounts();
        return ResponseEntity.ok(ApiResponse.ok(tagCounts));
    }
}
