package com.heygoodly.portal.modules.page.dto.request;

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
public class PageRequest {

    @NotBlank(message = "{validation.title.required}")
    @Size(max = 200, message = "{validation.title.size.200}")
    private String title;

    private String slug;
    private String image;

    @NotBlank(message = "{validation.content.required}")
    private String content;

    @Builder.Default
    private Boolean isActive = true;
    @Builder.Default
    private Integer sortOrder = com.heygoodly.portal.common.constant.AppConstants.DEFAULT_SORT_ORDER;
    private String metaTitle;
    private String metaDescription;
}
