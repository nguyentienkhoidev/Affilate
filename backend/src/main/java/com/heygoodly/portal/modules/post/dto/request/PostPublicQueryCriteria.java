package com.heygoodly.portal.modules.post.dto.request;

import com.heygoodly.portal.common.constant.AppConstants;
import lombok.Builder;
import org.springframework.data.domain.Pageable;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Builder
public record PostPublicQueryCriteria(
        Pageable pageable,
        Long categoryId,
        List<Long> categoryIds,
        String category,
        String categorySlug,
        List<String> categories,
        List<String> categorySlugs,
        String storeSlug,
        String search,
        String tag,
        List<String> tags,
        Boolean featured
) {
    public List<String> resolvedCategories() {
        List<String> result = new ArrayList<>();
        if (StringUtils.hasText(category)) {
            for (String item : category.split(AppConstants.COMMA)) {
                String trimmed = item.trim();
                if (!trimmed.isEmpty()) {
                    result.add(trimmed);
                }
            }
        }
        if (StringUtils.hasText(categorySlug)) {
            for (String item : categorySlug.split(AppConstants.COMMA)) {
                String trimmed = item.trim();
                if (!trimmed.isEmpty()) {
                    result.add(trimmed);
                }
            }
        }
        if (!CollectionUtils.isEmpty(categories)) {
            for (String c : categories) {
                if (StringUtils.hasText(c)) {
                    for (String item : c.split(AppConstants.COMMA)) {
                        String trimmed = item.trim();
                        if (!trimmed.isEmpty()) {
                            result.add(trimmed);
                        }
                    }
                }
            }
        }
        if (!CollectionUtils.isEmpty(categorySlugs)) {
            for (String cs : categorySlugs) {
                if (StringUtils.hasText(cs)) {
                    for (String item : cs.split(AppConstants.COMMA)) {
                        String trimmed = item.trim();
                        if (!trimmed.isEmpty()) {
                            result.add(trimmed);
                        }
                    }
                }
            }
        }
        return result;
    }

    public List<String> resolvedTags() {
        List<String> result = new ArrayList<>();
        if (StringUtils.hasText(tag)) {
            for (String item : tag.split(AppConstants.COMMA)) {
                String trimmed = item.trim();
                if (!trimmed.isEmpty()) {
                    result.add(trimmed);
                }
            }
        }
        if (!CollectionUtils.isEmpty(tags)) {
            for (String t : tags) {
                if (StringUtils.hasText(t)) {
                    for (String item : t.split(AppConstants.COMMA)) {
                        String trimmed = item.trim();
                        if (!trimmed.isEmpty()) {
                            result.add(trimmed);
                        }
                    }
                }
            }
        }
        return result;
    }
}
