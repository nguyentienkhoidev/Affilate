package com.heygoodly.portal.modules.menu.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;

/**
 * Menu target navigation type enum.
 */
@Getter
@RequiredArgsConstructor
public enum MenuTargetType {
    PAGE("page"),
    CATEGORY("category"),
    URL("url");

    private final String value;

    public static MenuTargetType fromValue(String value) {
        if (!StringUtils.hasText(value)) {
            return URL;
        }
        for (MenuTargetType t : values()) {
            if (t.value.equalsIgnoreCase(value.trim()) || t.name().equalsIgnoreCase(value.trim())) {
                return t;
            }
        }
        return URL;
    }
}

