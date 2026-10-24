package com.bargorya.portal.common.constant;

public final class RegexConstants {
    private RegexConstants() {}

    public static final String SLUG_PATTERN = "^[a-z0-9]+(?:-[a-z0-9]+)*$";
    public static final String EMAIL_PATTERN = "^[A-Za-z0-9+_.-]+@(.+)$";
    public static final String PHONE_PATTERN = "^[+0-9\\-\\s()]{7,25}$";
}
