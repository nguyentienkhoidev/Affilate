package com.bargorya.portal.modules.feedback.dto.response;

import java.time.Instant;

public record FeedbackResponse(
        Long id,
        String name,
        String email,
        String phone,
        String message,
        boolean isRead,
        Instant createdAt
) {}
