package com.bargorya.portal.modules.post.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostRequest {

    @NotBlank(message = "Title is required.")
    @Size(max = 255, message = "Title must not exceed 255 characters.")
    private String title;

    private String slug;
    private Long categoryId;
    private String image;
    private String excerpt;

    @NotBlank(message = "Content is required.")
    private String content;

    @Builder.Default
    private Boolean isFeatured = false;

    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private Integer sortOrder = 9999;

    private Instant publishedAt;
    private String metaTitle;
    private String metaKeywords;
    private String metaDescription;
}
