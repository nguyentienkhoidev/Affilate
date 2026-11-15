package com.heygoodly.portal.common.util;

import org.springframework.data.repository.CrudRepository;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.BiConsumer;
import java.util.function.Function;

/**
 * Batch-updates entity sortOrder values from an ordered list of IDs without N+1 queries.
 */
public final class SortOrderUtils {

    private SortOrderUtils() {
    }

    public static <T> void reorderEntities(
            List<Long> orderedIds,
            CrudRepository<T, Long> repository,
            Function<T, Long> idExtractor,
            BiConsumer<T, Integer> sortOrderSetter
    ) {
        if (CollectionUtils.isEmpty(orderedIds)) {
            return;
        }
        List<T> entities = new ArrayList<>();
        repository.findAllById(orderedIds).forEach(entities::add);
        Map<Long, T> entityMap = new HashMap<>(entities.size());
        for (T entity : entities) {
            entityMap.put(idExtractor.apply(entity), entity);
        }
        List<T> toSave = new ArrayList<>(orderedIds.size());
        for (int i = 0; i < orderedIds.size(); i++) {
            T entity = entityMap.get(orderedIds.get(i));
            if (entity != null) {
                sortOrderSetter.accept(entity, i + 1);
                toSave.add(entity);
            }
        }
        if (!toSave.isEmpty()) {
            repository.saveAll(toSave);
        }
    }
}
