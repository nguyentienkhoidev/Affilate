package com.heygoodly.portal.modules.audit.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Pageable;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogQueryCriteria {
    private String search;
    private String action;
    private String module;
    private String userEmail;
    private Instant startDate;
    private Instant endDate;
    private Pageable pageable;
}

