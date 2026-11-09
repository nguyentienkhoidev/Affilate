package com.heygoodly.portal.modules.post.dto.request;

import com.heygoodly.portal.common.constant.AppConstants;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostRequest {

    @NotBlank(message = "{validation.post.title.required}")
    @Size(max = 255, message = "{validation.title.size.255}")
    private String title;

    @Pattern(regexp = "^$|^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "{validation.slug.letters_numbers_hyphens}")
    @Size(max = 255, message = "{validation.slug.size.255}")
    private String slug;

    private Long categoryId;
    private Long storeId;
    private String storeSlug;
    private String image;
    private String excerpt;

    @NotBlank(message = "{validation.post.content.required}")
    private String content;

    private String readTime;

    @DecimalMin(value = "0.0", message = "{validation.post.rating.range}")
    @DecimalMax(value = "5.0", message = "{validation.post.rating.range}")
    private BigDecimal rating;

    @Builder.Default
    private Boolean isFeatured = false;

    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private Integer sortOrder = AppConstants.DEFAULT_SORT_ORDER;

    private Instant publishedAt;
    private String status;
    private List<String> tags;
    private Map<String, Object> sidebarConfig;
    private String metaTitle;
    private String metaKeywords;
    private String metaDescription;
    private String canonicalUrl;
}
