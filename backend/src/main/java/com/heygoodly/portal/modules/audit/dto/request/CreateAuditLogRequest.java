package com.heygoodly.portal.modules.audit.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAuditLogRequest {
    private Long userId;
    private String userEmail;

    @NotBlank(message = "{validation.field.required}")
    private String action;

    @NotBlank(message = "{validation.field.required}")
    private String module;

    private String resourceId;
    private String resourceName;
    private String ipAddress;
    private String device;
    private String changes;
    private String status;
}

