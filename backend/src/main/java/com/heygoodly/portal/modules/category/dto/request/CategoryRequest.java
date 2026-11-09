package com.heygoodly.portal.modules.category.dto.request;

import com.heygoodly.portal.common.constant.AppConstants;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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

    @NotBlank(message = "{validation.category.name.required}")
    @Size(max = 150, message = "{validation.category.name.size.150}")
    private String name;

    @Pattern(regexp = "^$|^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "{validation.slug.letters_numbers_hyphens}")
    @Size(max = 160, message = "{validation.slug.size.160}")
    private String slug;

    @Pattern(regexp = "^(post|store|offer)$", message = "{validation.category.type.one_of}")
    @Builder.Default
    private String type = "post";

    private Long parentId;
    private String image;

    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private Boolean showOnHome = false;

    @Builder.Default
    private Integer sortOrder = AppConstants.DEFAULT_SORT_ORDER;

    private String description;
    private String metaTitle;
    private String metaKeywords;
    private String metaDescription;
}
