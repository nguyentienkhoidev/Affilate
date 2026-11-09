package com.heygoodly.portal.modules.audit.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditStatsResponse {
    private Long totalEvents;
    private Long sensitiveActions;
    private Long activeOperators;
    private Long last24Hours;
    private List<String> availableActions;
    private List<String> availableModules;
    private List<String> availableOperators;
}

