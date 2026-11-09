package com.heygoodly.portal.modules.store.dto.request;

import com.heygoodly.portal.common.dto.BasePaginationCriteria;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StorePublicQueryCriteria extends BasePaginationCriteria {
    private String search;
    private String letter;
    private String category;
    private List<String> categories;
    private Boolean featured;
    private String tag;
    private List<String> tags;

    public java.util.List<String> resolvedCategories() {
        java.util.List<String> result = new java.util.ArrayList<>();
        if (org.springframework.util.StringUtils.hasText(category)) {
            for (String item : category.split(",")) {
                String trimmed = item.trim();
                if (!trimmed.isEmpty()) {
                    result.add(trimmed);
                }
            }
        }
        if (!org.springframework.util.CollectionUtils.isEmpty(categories)) {
            for (String c : categories) {
                if (org.springframework.util.StringUtils.hasText(c)) {
                    for (String item : c.split(",")) {
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

    public java.util.List<String> resolvedTags() {
        java.util.List<String> result = new java.util.ArrayList<>();
        if (org.springframework.util.StringUtils.hasText(tag)) {
            for (String item : tag.split(",")) {
                String trimmed = item.trim();
                if (!trimmed.isEmpty()) {
                    result.add(trimmed);
                }
            }
        }
        if (!org.springframework.util.CollectionUtils.isEmpty(tags)) {
            for (String t : tags) {
                if (org.springframework.util.StringUtils.hasText(t)) {
                    for (String item : t.split(",")) {
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

