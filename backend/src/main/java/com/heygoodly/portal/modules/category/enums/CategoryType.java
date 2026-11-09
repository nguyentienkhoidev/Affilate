package com.heygoodly.portal.modules.category.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;

/**
 * Editorial Category taxonomy type enum.
 */
@Getter
@RequiredArgsConstructor
public enum CategoryType {
    POST("post"),
    STORE("store"),
    OFFER("offer");

    private final String value;

    public static CategoryType fromValue(String value) {
        if (!StringUtils.hasText(value)) {
            return POST;
        }
        for (CategoryType t : values()) {
            if (t.value.equalsIgnoreCase(value.trim()) || t.name().equalsIgnoreCase(value.trim())) {
                return t;
            }
        }
        return POST;
    }
}

