package com.heygoodly.portal.common.constant;

/**
 * Strongly typed entity field and database column name constants.
 * Eliminates raw string literals like "name", "createdAt", "size_bytes" in Sort and JPA specifications.
 */
public final class EntityFieldConstants {

    private EntityFieldConstants() {}

    // Common Base Fields
    public static final String ID = "id";
    public static final String NAME = "name";
    public static final String EMAIL = "email";
    public static final String SOURCE = "source";
    public static final String SLUG = "slug";
    public static final String TITLE = "title";
    public static final String DESCRIPTION = "description";
    public static final String CONTENT = "content";
    public static final String STATUS = "status";
    public static final String TYPE = "type";
    public static final String SORT_ORDER = "sortOrder";
    public static final String CREATED_AT = "createdAt";
    public static final String CREATED_AT_SNAKE = "created_at";
    public static final String UPDATED_AT = "updatedAt";
    public static final String PUBLISHED_AT = "publishedAt";
    public static final String SUBSCRIBED_AT = "subscribedAt";
    public static final String IS_ACTIVE = "isActive";
    public static final String IS_DELETED = "isDeleted";
    public static final String IS_FEATURED = "isFeatured";
    public static final String IS_VERIFIED = "isVerified";
    public static final String IS_SEARCHABLE = "isSearchable";

    // Store & Offer Specific Fields
    public static final String STORE_ID = "storeId";
    public static final String CATEGORY_ID = "categoryId";
    public static final String AUTHOR_ID = "authorId";
    public static final String USER_ID = "userId";
    public static final String LOGO = "logo";
    public static final String IMAGE = "image";
    public static final String DOMAIN = "domain";
    public static final String CODE = "code";
    public static final String DISCOUNT_VALUE = "discountValue";
    public static final String EXPIRE_AT = "expireAt";
    public static final String AF_VISIT_COUNT = "afVisitCount";
    public static final String USES_COUNT = "usesCount";
    public static final String CLICK_COUNT = "clickCount";
    public static final String VIEW_COUNT = "viewCount";

    // User & Account Fields
    public static final String FULL_NAME = "fullName";
    public static final String ROLE = "role";
    public static final String TWO_FACTOR_ENABLED = "twoFactorEnabled";
    public static final String PARENT = "parent";

    // Media Specific Fields
    public static final String SIZE_BYTES = "size_bytes";
    public static final String MIME_TYPE = "mimeType";
    public static final String DIMENSIONS = "dimensions";
    public static final String ORIGINAL_NAME = "originalName";
    public static final String UPLOADED_BY = "uploadedBy";

    // Sort Directions
    public static final String ASC = "asc";
    public static final String DESC = "desc";
    public static final String OLDEST = "oldest";
    public static final String NEWEST = "newest";
    public static final String SIZE_DESC = "size-desc";
    public static final String NAME_ASC = "name-asc";

    // Entity Names
    public static final String ENTITY_STORE = "Store";
    public static final String ENTITY_OFFER = "Offer";
    public static final String ENTITY_CATEGORY = "Category";
    public static final String ENTITY_PAGE = "Page";
    public static final String ENTITY_POST = "Post";
    public static final String ENTITY_USER = "User";
    public static final String ENTITY_ROLE = "Role";
    public static final String ENTITY_TAG = "Tag";
    public static final String ENTITY_MENU = "Menu";
    public static final String ENTITY_MEDIA = "Media";

    // Uppercase Entity Types for Taxonomy & Junction Mappings
    public static final String TYPE_POST = "POST";
    public static final String TYPE_STORE = "STORE";
    public static final String TYPE_OFFER = "OFFER";
    public static final String TYPE_MEDIA = "MEDIA";
    public static final String TYPE_PAGE = "PAGE";
    public static final String TYPE_CATEGORY = "CATEGORY";
    public static final String TYPE_USER = "USER";
    public static final String TYPE_TAG = "TAG";
}

