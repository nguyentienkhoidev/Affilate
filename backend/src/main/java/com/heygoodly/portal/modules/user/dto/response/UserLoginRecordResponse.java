package com.heygoodly.portal.modules.user.dto.response;

import java.time.Instant;

public record UserLoginRecordResponse(
        Long id,
        Long userId,
        String ipAddress,
        String location,
        String device,
        String authMethod,
        String status,
        String duration,
        Instant createdAt
) {}

