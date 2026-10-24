package com.bargorya.portal.modules.offer.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class OfferRequest {

    @NotNull(message = "Store ID is required.")
    private Long storeId;

    @NotBlank(message = "Offer title is required.")
    private String name;

    @NotBlank(message = "Discount value is required.")
    private String discountValue;

    private String code;

    @NotBlank(message = "Affiliate tracking URL is required.")
    private String urlRef;

    private String description;

    @Builder.Default
    private Boolean isVerified = false;

    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private Integer sortOrder = 9999;

    private Instant expireAt;
}
