package com.bargorya.portal.common.util;

import com.bargorya.portal.common.constant.PaginationConstants;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public final class PaginationUtils {
    private PaginationUtils() {}

    public static Pageable createPageable(Integer page, Integer size, String sortBy, String sortDirection) {
        int pageNumber = (page == null || page < 0) ? PaginationConstants.DEFAULT_PAGE : page;
        int pageSize = (size == null || size <= 0) ? PaginationConstants.DEFAULT_PAGE_SIZE : Math.min(size, PaginationConstants.MAX_PAGE_SIZE);

        String sortField = (sortBy == null || sortBy.isBlank()) ? PaginationConstants.DEFAULT_SORT_BY : sortBy.trim();
        Sort.Direction direction = (sortDirection != null && sortDirection.equalsIgnoreCase("asc"))
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        return PageRequest.of(pageNumber, pageSize, Sort.by(direction, sortField));
    }
}
