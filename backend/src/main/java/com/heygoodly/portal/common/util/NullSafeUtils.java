package com.heygoodly.portal.common.util;

import com.heygoodly.portal.common.constant.AppConstants;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Set;

/**
 * Enterprise utility for comprehensive NullPointerException (NPE) prevention.
 * Provides defensive null-checks and safe default fallbacks across the application.
 */
public final class NullSafeUtils {

    private NullSafeUtils() {}

    /**
     * Safely trims a string without throwing NullPointerException.
     * Returns trimmed string, or AppConstants.EMPTY if null/blank.
     */
    public static String safeTrim(String value) {
        return (value == null || value.isBlank()) ? AppConstants.EMPTY : value.trim();
    }

    /**
     * Safely trims and lowercases a string (e.g. for email normalization, slugs, codes).
     */
    public static String safeLowerTrim(String value) {
        return (value == null || value.isBlank()) ? AppConstants.EMPTY : value.trim().toLowerCase();
    }

    /**
     * Safely trims a string or returns null if empty (ideal for optional DB columns).
     */
    public static String trimToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }

    /**
     * Null-safe boolean evaluator. Prevents NPE caused by auto-unboxing null Boolean objects.
     */
    public static boolean safeBoolean(Boolean value) {
        return Boolean.TRUE.equals(value);
    }

    /**
     * Null-safe fallback for Long numbers.
     */
    public static long safeLong(Long value, long defaultValue) {
        return value != null ? value : defaultValue;
    }

    /**
     * Null-safe fallback for Integer numbers.
     */
    public static int safeInt(Integer value, int defaultValue) {
        return value != null ? value : defaultValue;
    }

    /**
     * Returns the given list if non-null, or an unmodifiable empty list if null.
     */
    public static <T> List<T> safeList(List<T> list) {
        return list != null ? list : Collections.emptyList();
    }

    /**
     * Returns the given set if non-null, or an unmodifiable empty set if null.
     */
    public static <T> Set<T> safeSet(Set<T> set) {
        return set != null ? set : Collections.emptySet();
    }

    /**
     * Null-safe fallback for arbitrary objects.
     */
    public static <T> T requireNonNullElse(T object, T defaultObject) {
        return Objects.requireNonNullElse(object, defaultObject);
    }
}

