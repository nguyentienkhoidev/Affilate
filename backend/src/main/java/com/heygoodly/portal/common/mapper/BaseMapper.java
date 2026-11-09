package com.heygoodly.portal.common.mapper;

import org.springframework.util.CollectionUtils;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Generic Base Mapper contract providing default stream-based batch transformation methods.
 * Utilizes Stream API, Generics, lambda expressions, and method references.
 *
 * @param <E> Entity class
 * @param <D> Detail / Full Response DTO
 * @param <S> Summary / List Response DTO
 */
public interface BaseMapper<E, D, S> {

    /**
     * Map a single entity to its full detail response DTO.
     */
    D toDetailResponse(E entity);

    /**
     * Map a single entity to its summary/list response DTO.
     */
    S toSummaryResponse(E entity);

    /**
     * Stream-based batch transformation to a list of detail response DTOs.
     */
    default List<D> toDetailResponseList(List<E> entities) {
        if (CollectionUtils.isEmpty(entities)) {
            return Collections.emptyList();
        }
        return entities.stream()
                .filter(Objects::nonNull)
                .map(this::toDetailResponse)
                .collect(Collectors.toList());
    }

    /**
     * Stream-based batch transformation to a list of summary response DTOs.
     */
    default List<S> toSummaryResponseList(List<E> entities) {
        if (CollectionUtils.isEmpty(entities)) {
            return Collections.emptyList();
        }
        return entities.stream()
                .filter(Objects::nonNull)
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
    }
}

