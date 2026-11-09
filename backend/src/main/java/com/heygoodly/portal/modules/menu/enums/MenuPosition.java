package com.heygoodly.portal.modules.menu.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;

/**
 * Menu display position enum.
 */
@Getter
@RequiredArgsConstructor
public enum MenuPosition {
    MAIN("main"),
    HEADER("header"),
    FOOTER("footer");

    private final String value;

    public static MenuPosition fromValue(String value) {
        if (!StringUtils.hasText(value)) {
            return MAIN;
        }
        for (MenuPosition p : values()) {
            if (p.value.equalsIgnoreCase(value.trim()) || p.name().equalsIgnoreCase(value.trim())) {
                return p;
            }
        }
        return MAIN;
    }
}

