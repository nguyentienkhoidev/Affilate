package com.heygoodly.portal.modules.audit.service;

import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.modules.audit.dto.request.AuditLogQueryCriteria;
import com.heygoodly.portal.modules.audit.dto.request.CreateAuditLogRequest;
import com.heygoodly.portal.modules.audit.dto.response.AuditLogResponse;

public interface AuditLogService {

    void recordLog(CreateAuditLogRequest request);

    PageResponse<AuditLogResponse> getAuditLogs(AuditLogQueryCriteria criteria);

    AuditLogResponse getAuditLogById(Long id);

    com.heygoodly.portal.modules.audit.dto.response.AuditStatsResponse getAuditStats();
}

