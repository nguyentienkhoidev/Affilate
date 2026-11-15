package com.heygoodly.portal.modules.store.dto.response;

public record ReviewerProfileDto(
        Long id,
        String name,
        String avatarUrl,
        boolean isVerified
) {}
