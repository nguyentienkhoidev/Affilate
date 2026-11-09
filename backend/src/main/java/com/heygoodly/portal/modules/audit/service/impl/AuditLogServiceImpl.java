package com.heygoodly.portal.modules.audit.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.dto.PageResponse;
import com.heygoodly.portal.common.exception.ErrorCode;
import com.heygoodly.portal.common.exception.ResourceNotFoundException;
import com.heygoodly.portal.common.util.IpLocationUtils;
import com.heygoodly.portal.common.util.NetworkUtils;
import com.heygoodly.portal.common.util.NullSafeUtils;
import com.heygoodly.portal.common.util.SecurityUtils;
import com.heygoodly.portal.common.util.UserAgentUtils;
import com.heygoodly.portal.modules.audit.dto.request.AuditLogQueryCriteria;
import com.heygoodly.portal.modules.audit.dto.request.CreateAuditLogRequest;
import com.heygoodly.portal.modules.audit.dto.response.AuditLogResponse;
import com.heygoodly.portal.modules.audit.entity.AuditLogEntity;
import com.heygoodly.portal.modules.audit.enums.AuditSeverity;
import com.heygoodly.portal.modules.audit.repository.AuditLogRepository;
import com.heygoodly.portal.modules.audit.service.AuditLogService;
import com.heygoodly.portal.modules.user.entity.UserEntity;
import com.heygoodly.portal.modules.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Instant;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void recordLog(CreateAuditLogRequest request) {
        String cleanAction = NullSafeUtils.safeTrim(request.getAction()).toUpperCase();
        String cleanModule = NullSafeUtils.safeTrim(request.getModule());
        String cleanEmail = NullSafeUtils.safeLowerTrim(request.getUserEmail());

        Long userId = request.getUserId();
        if (userId == null) {
            userId = SecurityUtils.getCurrentUserId().orElse(null);
        }
        if (cleanEmail.isEmpty()) {
            cleanEmail = SecurityUtils.getCurrentUserEmail().orElse(AppConstants.EMPTY);
        }

        String ipAddress = NullSafeUtils.trimToNull(request.getIpAddress());
        String device = NullSafeUtils.trimToNull(request.getDevice());

        HttpServletRequest httpReq = getCurrentHttpRequest();
        if (httpReq != null) {
            if (ipAddress == null || "unknown".equalsIgnoreCase(ipAddress)) {
                ipAddress = NetworkUtils.getClientIp(httpReq);
            }
            if (device == null || "unknown".equalsIgnoreCase(device)) {
                device = httpReq.getHeader("User-Agent");
            }
        }

        if (ipAddress == null || ipAddress.isBlank() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = "127.0.0.1";
        }
        if ("::1".equals(ipAddress) || "0:0:0:0:0:0:0:1".equals(ipAddress)) {
            ipAddress = "127.0.0.1";
        }

        if (device == null || device.isBlank() || "unknown".equalsIgnoreCase(device)) {
            device = "Desktop Chrome / macOS";
        }

        AuditLogEntity entity = AuditLogEntity.builder()
                .userId(userId)
                .userEmail(cleanEmail.isEmpty() ? null : cleanEmail)
                .action(cleanAction)
                .module(cleanModule)
                .resourceId(NullSafeUtils.trimToNull(request.getResourceId()))
                .resourceName(NullSafeUtils.trimToNull(request.getResourceName()))
                .ipAddress(ipAddress)
                .device(device)
                .changes(NullSafeUtils.trimToNull(request.getChanges()))
                .status(NullSafeUtils.safeTrim(request.getStatus()).isEmpty() ? "SUCCESS" : request.getStatus())
                .createdAt(Instant.now())
                .build();

        auditLogRepository.save(entity);
    }

    private HttpServletRequest getCurrentHttpRequest() {
        try {
            RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
            if (attributes instanceof ServletRequestAttributes servletAttributes) {
                return servletAttributes.getRequest();
            }
        } catch (Exception ignored) {}
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getAuditLogs(AuditLogQueryCriteria criteria) {
        String search = NullSafeUtils.trimToNull(criteria.getSearch());
        String action = NullSafeUtils.trimToNull(criteria.getAction());
        String module = NullSafeUtils.trimToNull(criteria.getModule());
        String userEmail = NullSafeUtils.trimToNull(criteria.getUserEmail());

        org.springframework.data.jpa.domain.Specification<AuditLogEntity> spec = (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            if (action != null && !action.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("action")), action.toLowerCase()));
            }
            if (module != null && !module.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("module")), module.toLowerCase()));
            }
            if (userEmail != null && !userEmail.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("userEmail")), userEmail.toLowerCase()));
            }
            if (criteria.getStartDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), criteria.getStartDate()));
            }
            if (criteria.getEndDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), criteria.getEndDate()));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                jakarta.persistence.criteria.Predicate rName = cb.like(cb.lower(root.get("resourceName")), pattern);
                jakarta.persistence.criteria.Predicate rId = cb.like(cb.lower(root.get("resourceId")), pattern);
                jakarta.persistence.criteria.Predicate uEmail = cb.like(cb.lower(root.get("userEmail")), pattern);
                jakarta.persistence.criteria.Predicate act = cb.like(cb.lower(root.get("action")), pattern);
                jakarta.persistence.criteria.Predicate mod = cb.like(cb.lower(root.get("module")), pattern);
                predicates.add(cb.or(rName, rId, uEmail, act, mod));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<AuditLogEntity> page = auditLogRepository.findAll(spec, criteria.getPageable());

        // Zero N+1 query: Collect all userIds and batch fetch
        Set<Long> userIds = page.getContent()
                .stream()
                .map(AuditLogEntity::getUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, UserEntity> userMap = Collections.emptyMap();
        if (!userIds.isEmpty()) {
            List<UserEntity> users = userRepository.findAllById(userIds);
            userMap = users.stream()
                    .collect(Collectors.toMap(UserEntity::getId, Function.identity(), (existing, replacing) -> existing));
        }

        final Map<Long, UserEntity> finalUserMap = userMap;
        List<AuditLogResponse> responses = page.getContent()
                .stream()
                .map(entity -> mapToResponse(entity, finalUserMap.get(entity.getUserId())))
                .toList();

        return PageResponse.of(responses, page.getNumber(), page.getSize(), page.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public AuditLogResponse getAuditLogById(Long id) {
        AuditLogEntity entity = auditLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.AUDIT_LOG_NOT_FOUND));

        UserEntity user = null;
        if (entity.getUserId() != null) {
            user = userRepository.findById(entity.getUserId()).orElse(null);
        }

        return mapToResponse(entity, user);
    }

    @Override
    @Transactional(readOnly = true)
    public com.heygoodly.portal.modules.audit.dto.response.AuditStatsResponse getAuditStats() {
        long totalEvents = auditLogRepository.count();
        long sensitiveActions = auditLogRepository.countSensitiveActions();
        long activeOperators = auditLogRepository.countDistinctOperators();
        Instant since24h = Instant.now().minus(java.time.Duration.ofHours(24));
        long last24Hours = auditLogRepository.countByCreatedAtGreaterThanEqual(since24h);

        List<String> actions = auditLogRepository.findDistinctActions();
        List<String> modules = auditLogRepository.findDistinctModules();
        List<String> operators = auditLogRepository.findDistinctUserEmails();

        return com.heygoodly.portal.modules.audit.dto.response.AuditStatsResponse.builder()
                .totalEvents(totalEvents)
                .sensitiveActions(sensitiveActions)
                .activeOperators(activeOperators)
                .last24Hours(last24Hours)
                .availableActions(actions)
                .availableModules(modules)
                .availableOperators(operators)
                .build();
    }

    private AuditLogResponse mapToResponse(AuditLogEntity entity, UserEntity user) {
        String userName = user != null ? user.getFullName() : (entity.getUserEmail() != null ? entity.getUserEmail() : AppConstants.SYSTEM_USER);
        String userEmail = user != null ? user.getEmail() : (entity.getUserEmail() != null ? entity.getUserEmail() : AppConstants.EMPTY);
        String userRole = user != null && user.getRole() != null ? user.getRole().getName() : (user != null && Boolean.TRUE.equals(user.getIsSuperAdmin()) ? "Super Administrator" : "Staff");
        String userAvatar = user != null ? user.getAvatar() : null;

        // Build Action Title with StringBuilder (No literal string concatenation with +)
        StringBuilder titleBuilder = new StringBuilder();
        titleBuilder.append(entity.getAction())
                .append(AppConstants.SPACE)
                .append(entity.getModule());
        if (entity.getResourceName() != null && !entity.getResourceName().isBlank()) {
            titleBuilder.append(AppConstants.COLON)
                    .append(AppConstants.SPACE)
                    .append(entity.getResourceName());
        }
        String actionTitle = titleBuilder.toString();

        // Target Href
        StringBuilder hrefBuilder = new StringBuilder();
        if (entity.getModule() != null && entity.getResourceId() != null) {
            hrefBuilder.append("/admin/")
                    .append(entity.getModule().toLowerCase())
                    .append(AppConstants.SLASH)
                    .append(entity.getResourceId());
        }
        String targetHref = hrefBuilder.length() > 0 ? hrefBuilder.toString() : null;

        // Determine severity
        String severity = resolveSeverity(entity.getAction(), entity.getStatus());

        // Parse changes JSON if available
        Map<String, Object> detailsMap = new HashMap<>();
        if (entity.getChanges() != null && !entity.getChanges().isBlank()) {
            try {
                Map<String, Object> parsed = objectMapper.readValue(entity.getChanges(), new TypeReference<Map<String, Object>>() {});
                detailsMap.putAll(parsed);
            } catch (Exception ex) {
                detailsMap.put("rawChanges", entity.getChanges());
            }
        }
        detailsMap.put("summary", actionTitle);

        StringBuilder idBuilder = new StringBuilder();
        idBuilder.append("trc-").append(entity.getId());

        String ip = entity.getIpAddress();
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip.trim())) {
            ip = "127.0.0.1";
        }
        if ("::1".equals(ip) || "0:0:0:0:0:0:0:1".equals(ip)) {
            ip = "127.0.0.1";
        }

        String rawDevice = entity.getDevice();
        if (rawDevice == null || rawDevice.isBlank() || "unknown".equalsIgnoreCase(rawDevice.trim())) {
            rawDevice = "Desktop Chrome / macOS";
        }

        String platformOs = UserAgentUtils.parsePlatformOs(rawDevice);
        String location = IpLocationUtils.resolveLocation(ip);

        return AuditLogResponse.builder()
                .id(idBuilder.toString())
                .timestamp(entity.getCreatedAt())
                .userId(entity.getUserId())
                .userName(userName)
                .userEmail(userEmail)
                .userRole(userRole)
                .userAvatar(userAvatar)
                .action(entity.getAction())
                .actionTitle(actionTitle)
                .module(entity.getModule())
                .targetId(entity.getResourceId())
                .targetName(entity.getResourceName())
                .targetHref(targetHref)
                .ipAddress(ip)
                .userAgent(rawDevice)
                .deviceType(platformOs)
                .location(location)
                .severity(severity)
                .details(detailsMap)
                .build();
    }

    private String resolveSeverity(String action, String status) {
        if ("FAILED".equalsIgnoreCase(status) || "DELETE".equalsIgnoreCase(action) || "SECURITY_LOCKDOWN".equalsIgnoreCase(action)) {
            return AuditSeverity.DANGER.getValue();
        }
        if ("CREATE".equalsIgnoreCase(action) || "PUBLISH".equalsIgnoreCase(action) || "SUCCESS".equalsIgnoreCase(status)) {
            return AuditSeverity.SUCCESS.getValue();
        }
        if ("UPDATE".equalsIgnoreCase(action) || "RBAC_CHANGE".equalsIgnoreCase(action) || "WARNING".equalsIgnoreCase(status)) {
            return AuditSeverity.WARNING.getValue();
        }
        return AuditSeverity.INFO.getValue();
    }
}

