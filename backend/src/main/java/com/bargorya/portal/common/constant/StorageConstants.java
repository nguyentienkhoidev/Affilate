package com.bargorya.portal.common.constant;

import java.util.List;

public final class StorageConstants {
    private StorageConstants() {}

    public static final long MAX_IMAGE_FILE_SIZE_BYTES = 10 * 1024 * 1024L; // 10MB
    public static final List<String> ALLOWED_IMAGE_EXTENSIONS = List.of("jpg", "jpeg", "png", "webp");
    public static final List<String> ALLOWED_MIME_TYPES = List.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    public static final String FOLDER_STORES = "stores";
    public static final String FOLDER_POSTS = "posts";
    public static final String FOLDER_BANNERS = "banners";
    public static final String FOLDER_CATEGORIES = "categories";

    public static final int THUMBNAIL_WIDTH = 300;
    public static final int FULL_SIZE_WIDTH = 1200;
}
