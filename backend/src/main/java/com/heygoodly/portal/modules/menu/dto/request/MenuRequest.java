package com.heygoodly.portal.modules.menu.dto.request;

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
public class MenuRequest {

    private Long parentId;

    @NotBlank(message = "{validation.menu.position.required}")
    @Size(max = 50, message = "{validation.menu.position.size}")
    private String position;

    @NotBlank(message = "{validation.menu.title.required}")
    @Size(max = 150, message = "{validation.menu.title.size}")
    private String title;

    @NotBlank(message = "{validation.menu.target_type.required}")
    @Size(max = 50, message = "{validation.menu.target_type.size}")
    private String targetType;

    @NotBlank(message = "{validation.menu.target_value.required}")
    @Size(max = 500, message = "{validation.menu.target_value.size}")
    private String targetValue;

    private String imageIcon;
    @Builder.Default
    private Integer sortOrder = com.heygoodly.portal.common.constant.AppConstants.DEFAULT_SORT_ORDER;
    @Builder.Default
    private Boolean isActive = true;
}
