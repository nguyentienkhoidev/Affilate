package com.heygoodly.portal.modules.user.dto.response;

import java.time.Instant;

public record SessionResponse(
        Long id,
        String device,
        String browser,
        String ipAddress,
        String location,
        String authMethod,
        String lastActive,
        boolean isCurrent,
        Instant createdAt
) {}

