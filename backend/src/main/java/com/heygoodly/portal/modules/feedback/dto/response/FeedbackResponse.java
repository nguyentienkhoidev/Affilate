package com.heygoodly.portal.modules.feedback.dto.response;

import java.time.Instant;

public record FeedbackResponse(
        Long id,
        String name,
        String email,
        String phone,
        String type,
        String message,
        boolean isRead,
        Instant createdAt
) {
    public FeedbackResponse(Long id, String name, String email, String phone, String message, boolean isRead, Instant createdAt) {
        this(id, name, email, phone, "GENERAL", message, isRead, createdAt);
    }
}
