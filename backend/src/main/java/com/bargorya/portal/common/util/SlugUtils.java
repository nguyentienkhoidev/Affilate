package com.bargorya.portal.common.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public final class SlugUtils {
    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");
    private static final Pattern MULTI_HYPHEN = Pattern.compile("-+");

    private SlugUtils() {}

    public static String toSlug(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }

        // Vietnamese tone marks and diacritics normalization
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        normalized = normalized.replaceAll("\\p{M}", "");
        normalized = normalized.replace("đ", "d").replace("Đ", "d");

        String nowhitespace = WHITESPACE.matcher(normalized).replaceAll("-");
        String slug = NON_LATIN.matcher(nowhitespace).replaceAll("");
        slug = MULTI_HYPHEN.matcher(slug).replaceAll("-");
        slug = slug.toLowerCase(Locale.ENGLISH);

        // Strip leading/trailing hyphen
        if (slug.startsWith("-")) {
            slug = slug.substring(1);
        }
        if (slug.endsWith("-")) {
            slug = slug.substring(0, slug.length() - 1);
        }

        return slug;
    }
}
