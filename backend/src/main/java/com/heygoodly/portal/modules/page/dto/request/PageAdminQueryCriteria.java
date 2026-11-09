package com.heygoodly.portal.modules.page.dto.request;

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
public class PageAdminQueryCriteria extends BasePaginationCriteria {
    private String search;
    private Boolean isActive;
}

