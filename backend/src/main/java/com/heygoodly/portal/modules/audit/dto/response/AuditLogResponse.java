package com.heygoodly.portal.modules.audit.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    private String id;
    private Instant timestamp;
    private Long userId;
    private String userName;
    private String userEmail;
    private String userRole;
    private String userAvatar;
    private String action;
    private String actionTitle;
    private String module;
    private String targetId;
    private String targetName;
    private String targetHref;
    private String ipAddress;
    private String userAgent;
    private String deviceType;
    private String location;
    private String severity;
    private Map<String, Object> details;
}

