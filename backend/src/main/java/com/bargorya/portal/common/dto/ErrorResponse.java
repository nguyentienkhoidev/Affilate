package com.bargorya.portal.common.dto;

import lombok.Builder;

import java.time.Instant;
import java.util.Map;

@Builder
public record ErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String errorCode,
        String message,
        String path,
        Map<String, String> validationErrors
) {}
