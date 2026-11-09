package com.heygoodly.portal.modules.tag.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TagRequest {

    @NotBlank(message = "{validation.tag.name.blank}")
    @Size(max = 100, message = "{validation.tag.name.size.100}")
    private String name;

    @Size(max = 120, message = "{validation.slug.size.120}")
    private String slug;

    private String description;

    @Pattern(regexp = "^$|^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "{validation.color.hex}")
    @Size(max = 30, message = "{validation.color.size.30}")
    private String color;

    private Boolean isFeatured;

    private Boolean isActive;
}

