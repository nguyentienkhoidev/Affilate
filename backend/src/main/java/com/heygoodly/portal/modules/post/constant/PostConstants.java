package com.heygoodly.portal.modules.post.constant;

public final class PostConstants {

    private PostConstants() {}

    public static final String ENTITY_POST = "Post";
    public static final String ENTITY_CATEGORY = "Category";
    public static final String ENTITY_STORE = "Store";

    public static final String FIELD_ID = "id";
    public static final String FIELD_SLUG = "slug";
    public static final String FIELD_TITLE = "title";
    public static final String FIELD_EXCERPT = "excerpt";
    public static final String FIELD_META_KEYWORDS = "metaKeywords";
    public static final String FIELD_TAGS = "tags";
    public static final String FIELD_CATEGORY_ID = "categoryId";
    public static final String FIELD_STORE_ID = "storeId";
    public static final String FIELD_IS_DELETED = "isDeleted";
    public static final String FIELD_IS_ACTIVE = "isActive";
    public static final String FIELD_IS_FEATURED = "isFeatured";
    public static final String FIELD_PUBLISHED_AT = "publishedAt";

    public static final String FILTER_ALL = "all";
    public static final String DEFAULT_AUTHOR_NAME = "Editorial Team";
    public static final String DEFAULT_AUTHOR_ROLE = "Editorial Desk";
    public static final String DEFAULT_READ_TIME = "5 min read";
    public static final String MIN_READ_SUFFIX = " min read";
    public static final String COPY_SUFFIX = " (Copy)";
    public static final String DELETED_SEGMENT = "deleted";

    public static final String KEYWORD_SPLIT_REGEX = "[,;]+";
    public static final String LEADING_HASH_REGEX = "^#+";
    public static final String HTML_TAG_REGEX = "<[^>]*>";
    public static final String WHITESPACE_REGEX = "\\s+";
}

