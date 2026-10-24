package com.bargorya.portal.modules.feedback.controller;

import com.bargorya.portal.common.constant.MessageConstants;
import com.bargorya.portal.common.constant.PermissionConstants;
import com.bargorya.portal.common.dto.ApiResponse;
import com.bargorya.portal.common.dto.PageResponse;
import com.bargorya.portal.common.util.PaginationUtils;
import com.bargorya.portal.modules.feedback.dto.response.FeedbackResponse;
import com.bargorya.portal.modules.feedback.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/feedbacks")
@RequiredArgsConstructor
public class FeedbackAdminController {

    private final FeedbackService feedbackService;

    @GetMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.FEEDBACK_VIEW + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<FeedbackResponse>>> list(
            @RequestParam(value = "page", required = false, defaultValue = "0") Integer page,
            @RequestParam(value = "size", required = false, defaultValue = "20") Integer size,
            @RequestParam(value = "sortBy", required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(value = "direction", required = false, defaultValue = "desc") String direction
    ) {
        Pageable pageable = PaginationUtils.createPageable(page, size, sortBy, direction);
        PageResponse<FeedbackResponse> result = feedbackService.getFeedbacks(pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("hasAuthority('" + PermissionConstants.FEEDBACK_VIEW + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable("id") Long id,
            @RequestParam(value = "isRead", defaultValue = "true") boolean isRead
    ) {
        feedbackService.markAsRead(id, isRead);
        return ResponseEntity.ok(ApiResponse.success(null, MessageConstants.UPDATED_SUCCESS));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.FEEDBACK_DELETE + "') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable("id") Long id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.ok(ApiResponse.success(null, MessageConstants.DELETED_SUCCESS));
    }
}
