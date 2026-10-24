package com.bargorya.portal.modules.page.dto.request;

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

    @NotBlank(message = "Title is required.")
    @Size(max = 200, message = "Title must not exceed 200 characters.")
    private String title;

    private String slug;
    private String image;

    @NotBlank(message = "Content is required.")
    private String content;

    private Boolean isActive;
    private Integer sortOrder;
    private String metaTitle;
    private String metaDescription;
}
