package com.heygoodly.portal.modules.subscriber.controller;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.constant.EntityFieldConstants;
import com.heygoodly.portal.common.constant.MessageConstants;
import com.heygoodly.portal.common.constant.PermissionConstants;
import com.heygoodly.portal.common.dto.ApiResponse;
import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.common.util.PaginationUtils;
import com.heygoodly.portal.modules.role.enums.RoleCode;
import com.heygoodly.portal.modules.subscriber.dto.request.SubscriberQueryCriteria;
import com.heygoodly.portal.modules.subscriber.dto.response.SubscriberResponse;
import com.heygoodly.portal.modules.subscriber.enums.SubscriberStatus;
import com.heygoodly.portal.modules.subscriber.service.SubscriberService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/subscribers")
@RequiredArgsConstructor
public class SubscriberAdminController {

    private final SubscriberService subscriberService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<SubscriberResponse>>> list(@ModelAttribute SubscriberQueryCriteria criteria) {
        Pageable pageable = criteria.getEffectivePageable();
        criteria.setPageable(pageable);
        criteria.setStatus(criteria.resolveStatus());

        PageResponse<SubscriberResponse> result = subscriberService.getSubscribers(criteria);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PatchMapping("/{id}/unsubscribe")
    @PreAuthorize("hasAuthority('" + PermissionConstants.SUBSCRIBER_VIEW + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "') or hasAuthority('" + RoleCode.ROLE_ADMIN + "')")
    public ResponseEntity<ApiResponse<Void>> unsubscribe(@PathVariable("id") Long id) {
        subscriberService.unsubscribe(id);
        return ResponseEntity.ok(ApiResponse.success(null, MessageConstants.UNSUBSCRIBED_SUCCESS));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.SUBSCRIBER_DELETE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "') or hasAuthority('" + RoleCode.ROLE_ADMIN + "')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable("id") Long id) {
        subscriberService.deleteSubscriber(id);
        return ResponseEntity.ok(ApiResponse.success(null, MessageConstants.DELETED_SUCCESS));
    }
}

