package com.bargorya.portal.modules.category.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryRequest {

    @NotBlank(message = "Category name is required.")
    @Size(max = 150, message = "Category name must not exceed 150 characters.")
    private String name;

    private String slug;

    @Builder.Default
    private String type = "post";

    private Long parentId;
    private String image;

    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private Boolean showOnHome = false;

    @Builder.Default
    private Integer sortOrder = 9999;

    private String description;
    private String metaTitle;
    private String metaKeywords;
    private String metaDescription;
}
