package com.heygoodly.portal.modules.store.dto.request;

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
public class StoreAdminQueryCriteria extends BasePaginationCriteria {
    private String search;
    private String status;
    private Long categoryId;
    private String category;
    private String tag;
}

