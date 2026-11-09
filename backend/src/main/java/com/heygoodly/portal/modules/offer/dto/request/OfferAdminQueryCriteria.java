package com.heygoodly.portal.modules.offer.dto.request;

import com.heygoodly.portal.common.dto.BasePaginationCriteria;
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
public class OfferAdminQueryCriteria extends BasePaginationCriteria {
    private Long storeId;
    private String search;
    private String type;
    private Boolean verified;
}

