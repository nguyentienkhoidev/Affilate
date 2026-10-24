package com.bargorya.portal.modules.store.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreRequest {

    @NotBlank(message = "Store name is required.")
    @Size(max = 150, message = "Store name must not exceed 150 characters.")
    private String name;

    private String slug;
    private Long categoryId;
    private Long assignedUserId;
    private String logo;
    private String socialCardImage;
    private String socialTitle;
    private String socialDescription;
    private String aboutStore;

    @Builder.Default
    private Integer maxOffer = 50;

    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private Boolean isSearchable = true;

    @Builder.Default
    private Integer sortOrder = 9999;

    private BigDecimal ratingScore;
    private Integer ratingCount;
    private String afWebsite;
    private String afStatus;
    private String afNetwork;
    private String afPortalUrl;
    private String afAccount;
    private String afCommission;
    private String internalNote;
    private String adsStatus;
    private String adsAccount;
    private String metaTitle;
    private String metaKeywords;
    private String metaDescription;
}
