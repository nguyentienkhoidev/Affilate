package com.heygoodly.portal.modules.tag.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TagResponse {

    private Long id;
    private String name;
    private String slug;
    private String description;
    private String color;
    private Boolean isFeatured;
    private Boolean isActive;
    private Long postsCount;
    private Long storesCount;
    private Long offersCount;
    private Long mediaCount;
    private Long totalUsageCount;
    private Instant createdAt;
    private Instant updatedAt;
}
