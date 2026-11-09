package com.heygoodly.portal.common.dto;

import com.heygoodly.portal.common.constant.PaginationConstants;
import com.heygoodly.portal.common.util.PaginationUtils;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Pageable;

@Getter
@Setter
public class BasePaginationCriteria {
    private int page = PaginationConstants.DEFAULT_PAGE;
    private int size = PaginationConstants.DEFAULT_PAGE_SIZE;
    private String sortBy = PaginationConstants.DEFAULT_SORT_BY;
    private String direction = PaginationConstants.DEFAULT_SORT_DIRECTION;

    public Pageable toPageable() {
        return PaginationUtils.createPageable(page, size, sortBy, direction);
    }
}

