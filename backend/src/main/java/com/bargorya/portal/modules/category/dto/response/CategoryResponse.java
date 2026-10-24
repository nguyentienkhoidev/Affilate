package com.bargorya.portal.modules.category.dto.response;

public record CategoryResponse(
        Long id,
        String name,
        String slug,
        String type,
        Long parentId,
        String parentName,
        String image,
        boolean isActive,
        boolean showOnHome,
        int sortOrder,
        String description,
        String metaTitle,
        String metaKeywords,
        String metaDescription
) {}
