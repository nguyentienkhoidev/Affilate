package com.heygoodly.portal.modules.store.dto.request;

import com.heygoodly.portal.common.constant.AppConstants;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreRequest {

    @NotBlank(message = "{validation.store.name.required}")
    @Size(max = 150, message = "{validation.store.name.size}")
    private String name;

    @Pattern(regexp = "^$|^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "{validation.slug.letters_numbers_hyphens}")
    @Size(max = 160, message = "{validation.slug.size.160}")
    private String slug;

    private Long categoryId;
    private Long assignedUserId;
    private String logo;
    private String socialCardImage;
    private String socialTitle;
    private String socialDescription;
    private String aboutStore;

    @Min(value = 1, message = "{validation.store.max_offer.min}")
    @Max(value = 500, message = "{validation.store.max_offer.max}")
    @Builder.Default
    private Integer maxOffer = 50;

    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private Boolean isSearchable = true;

    @Builder.Default
    private Boolean isFeatured = false;

    @Builder.Default
    private Integer sortOrder = AppConstants.DEFAULT_SORT_ORDER;

    @DecimalMin(value = "0.0", message = "{validation.store.rating.min}")
    @DecimalMax(value = "5.0", message = "{validation.store.rating.max}")
    private BigDecimal ratingScore;

    @Min(value = 0, message = "{validation.store.rating_count.min}")
    private Integer ratingCount;
    private String afWebsite;
    private String afStatus;
    private String afPortalUrl;
    private String afAccount;
    private String afCommission;
    private String internalNote;
    private String adsStatus;
    private String adsAccount;
    private String metaTitle;
    private String metaKeywords;
    private String metaDescription;
    private List<String> popularSearches;
    private List<StoreFaqDto> faqs;
    private List<String> tags;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StoreFaqDto {
        private String question;
        private String answer;
    }
}
