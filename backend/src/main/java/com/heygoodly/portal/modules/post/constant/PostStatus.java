package com.heygoodly.portal.modules.post.constant;

public enum PostStatus {
    PUBLISHED,
    SCHEDULED,
    DRAFT;

    public static PostStatus fromString(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        for (PostStatus status : values()) {
            if (status.name().equalsIgnoreCase(value.trim())) {
                return status;
            }
        }
        return null;
    }
}

