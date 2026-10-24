package com.bargorya.portal.modules.menu.dto.request;

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

    @NotBlank(message = "Position is required ('main', 'header', 'footer').")
    @Size(max = 50, message = "Position must not exceed 50 characters.")
    private String position;

    @NotBlank(message = "Title is required.")
    @Size(max = 150, message = "Title must not exceed 150 characters.")
    private String title;

    @NotBlank(message = "Target type is required ('page', 'category', 'url').")
    @Size(max = 50, message = "Target type must not exceed 50 characters.")
    private String targetType;

    @NotBlank(message = "Target value is required.")
    @Size(max = 500, message = "Target value must not exceed 500 characters.")
    private String targetValue;

    private String imageIcon;
    private Integer sortOrder;
    private Boolean isActive;
}
