package com.heygoodly.portal.common.constant;

public final class AppConstants {
    private AppConstants() {}

    public static final String APP_NAME = "HeyGoodly";
    public static final String DEFAULT_TIMEZONE = "UTC";
    public static final String DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
    public static final String DATE_FORMAT = "yyyy-MM-dd";
    public static final String DEFAULT_ENCODING = "UTF-8";

    // Reusable Character & String Symbols (Avoid "" and literal strings)
    public static final String EMPTY = "";
    public static final String SPACE = " ";
    public static final String SLASH = "/";
    public static final String BACKSLASH = "\\";
    public static final String DOT = ".";
    public static final String COMMA = ",";
    public static final String COLON = ":";
    public static final String SEMICOLON = ";";
    public static final String HYPHEN = "-";
    public static final String UNDERSCORE = "_";
    public static final String PERCENT = "%";
    public static final String EQUALS = "=";
    public static final String QUESTION_MARK = "?";
    public static final String AMPERSAND = "&";
    public static final String AT = "@";
    public static final String HASH = "#";

    // System Identities
    public static final String SYSTEM_USER = "system";
    public static final String ANONYMOUS_USER = "anonymousUser";
    public static final String UNKNOWN = "unknown";
    public static final String STATUS_KEY = "status";
    public static final String STATUS_UP = "UP";

    // Default Numeric & Value Constants (Eliminate magic numbers)
    public static final int DEFAULT_SORT_ORDER = 9999;
    public static final int DEFAULT_PAGE_NUMBER = 0;
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int DEFAULT_MEDIA_PAGE_SIZE = 24;
    public static final int DEFAULT_TOP_LIMIT = 5;
    public static final int MAX_PAGE_SIZE = 100;
    public static final String DEFAULT_TAG_COLOR = "#6366f1";
    public static final String DEFAULT_DIMENSIONS = "Optimized";
    public static final String DEFAULT_IMAGE_FORMAT = "WEBP";
    public static final String DEFAULT_MEDIA_CATEGORY = "articles";
    public static final String DEFAULT_ASSET_NAME = "asset";
    public static final String DEFAULT_MENU_POSITION = "main";
    public static final String DEFAULT_PAGE_NUMBER_STR = "0";
    public static final String DEFAULT_PAGE_SIZE_STR = "20";
    public static final String DEFAULT_PUBLIC_PAGE_SIZE_STR = "24";
    public static final String DEFAULT_SORT_DIRECTION_ASC = "asc";
    public static final String DEFAULT_SORT_DIRECTION_DESC = "desc";
    public static final String ALL = "all";
    public static final String DEFAULT_LOOPBACK_IPV4 = "127.0.0.1";
    public static final String DEFAULT_LOOPBACK_IPV6 = "::1";
    public static final String DEFAULT_LOOPBACK_IPV6_FULL = "0:0:0:0:0:0:0:1";
}
