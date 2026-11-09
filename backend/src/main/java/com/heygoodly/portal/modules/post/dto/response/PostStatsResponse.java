package com.heygoodly.portal.modules.post.dto.response;

public record PostStatsResponse(
        long total,
        long published,
        long scheduled,
        long draft,
        long totalViews
) {}

