package com.heygoodly.portal.modules.audit.controller;

import com.heygoodly.portal.common.constant.MessageConstants;
import com.heygoodly.portal.common.constant.PermissionConstants;
import com.heygoodly.portal.common.dto.ApiResponse;
import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.common.util.PaginationUtils;
import com.heygoodly.portal.modules.audit.dto.request.AuditLogQueryCriteria;
import com.heygoodly.portal.modules.audit.dto.request.CreateAuditLogRequest;
import com.heygoodly.portal.modules.audit.dto.response.AuditLogResponse;
import com.heygoodly.portal.modules.audit.service.AuditLogService;
import com.heygoodly.portal.modules.role.enums.RoleCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping({"/api/v1/admin/audit", "/api/v1/admin/tracing"})
@RequiredArgsConstructor
public class AuditLogAdminController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<AuditLogResponse>>> list(
            @RequestParam(value = "page", required = false, defaultValue = "0") Integer page,
            @RequestParam(value = "size", required = false, defaultValue = "20") Integer size,
            @RequestParam(value = "sortBy", required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(value = "direction", required = false, defaultValue = "desc") String direction,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "action", required = false) String action,
            @RequestParam(value = "module", required = false) String module,
            @RequestParam(value = "user", required = false) String userEmail,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate
    ) {
        Pageable pageable = PaginationUtils.createPageable(page, size, sortBy, direction);

        AuditLogQueryCriteria criteria = AuditLogQueryCriteria.builder()
                .search(search)
                .action(action)
                .module(module)
                .userEmail(userEmail)
                .startDate(startDate)
                .endDate(endDate)
                .pageable(pageable)
                .build();

        PageResponse<AuditLogResponse> response = auditLogService.getAuditLogs(criteria);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/stats")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<com.heygoodly.portal.modules.audit.dto.response.AuditStatsResponse>> stats() {
        com.heygoodly.portal.modules.audit.dto.response.AuditStatsResponse response = auditLogService.getAuditStats();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AuditLogResponse>> getById(@PathVariable("id") Long id) {
        AuditLogResponse response = auditLogService.getAuditLogById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.BACKEND_ACCESS + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "') or hasAuthority('" + RoleCode.ROLE_ADMIN + "')")
    public ResponseEntity<ApiResponse<Void>> recordLog(@Valid @RequestBody CreateAuditLogRequest request) {
        auditLogService.recordLog(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(null, MessageConstants.CREATED_SUCCESS));
    }
}

