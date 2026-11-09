package com.heygoodly.portal.modules.offer.dto.request;

import com.heygoodly.portal.common.constant.AppConstants;
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

    @NotNull(message = "{validation.offer.store_id.required}")
    private Long storeId;

    @NotBlank(message = "{validation.offer.title.required}")
    private String name;

    @NotBlank(message = "{validation.offer.discount_value.required}")
    private String discountValue;

    private String code;

    @NotBlank(message = "{validation.offer.affiliate_url.required}")
    private String urlRef;

    private String description;

    @Builder.Default
    private Boolean isVerified = false;

    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private Integer sortOrder = AppConstants.DEFAULT_SORT_ORDER;

    private Instant expireAt;

    private String image;

    private java.util.List<String> tags;
}
