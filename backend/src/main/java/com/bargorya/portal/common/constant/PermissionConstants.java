package com.bargorya.portal.common.constant;

public final class PermissionConstants {
    private PermissionConstants() {}

    // Auth & Backend Access
    public static final String BACKEND_ACCESS = "backend.access";

    // Categories
    public static final String CATEGORY_VIEW = "category.view";
    public static final String CATEGORY_CREATE = "category.create";
    public static final String CATEGORY_UPDATE = "category.update";
    public static final String CATEGORY_DELETE = "category.delete";

    // Posts
    public static final String POST_VIEW = "post.view";
    public static final String POST_CREATE = "post.create";
    public static final String POST_UPDATE = "post.update";
    public static final String POST_DELETE = "post.delete";
    public static final String POST_CLONE = "post.clone";
    public static final String POST_PUBLISH = "post.publish";

    // Stores
    public static final String STORE_VIEW = "store.view";
    public static final String STORE_CREATE = "store.create";
    public static final String STORE_UPDATE = "store.update";
    public static final String STORE_DELETE = "store.delete";
    public static final String STORE_AFFILIATE_INTEL = "store.affiliate_intel";
    public static final String STORE_ADS_ASSIGN = "store.ads_assign";

    // Offers
    public static final String OFFER_VIEW = "offer.view";
    public static final String OFFER_CREATE = "offer.create";
    public static final String OFFER_UPDATE = "offer.update";
    public static final String OFFER_DELETE = "offer.delete";
    public static final String OFFER_VERIFY = "offer.verify";
    public static final String OFFER_CLONE = "offer.clone";

    // Pages
    public static final String PAGE_VIEW = "page.view";
    public static final String PAGE_CREATE = "page.create";
    public static final String PAGE_UPDATE = "page.update";
    public static final String PAGE_DELETE = "page.delete";

    // Navigation & Menu
    public static final String MENU_MANAGE = "menu.manage";

    // Feedback
    public static final String FEEDBACK_VIEW = "feedback.view";
    public static final String FEEDBACK_DELETE = "feedback.delete";

    // Files
    public static final String FILE_UPLOAD = "file.upload";
    public static final String FILE_DELETE = "file.delete";

    // Users & 2FA
    public static final String USER_VIEW = "user.view";
    public static final String USER_CREATE = "user.create";
    public static final String USER_UPDATE = "user.update";
    public static final String USER_DELETE = "user.delete";
    public static final String USER_2FA_SELF = "user.2fa_self";
    public static final String USER_2FA_RESET = "user.2fa_reset";

    // Roles
    public static final String ROLE_VIEW = "role.view";
    public static final String ROLE_CREATE = "role.create";
    public static final String ROLE_UPDATE = "role.update";
    public static final String ROLE_DELETE = "role.delete";

    // Settings
    public static final String SETTING_GENERAL = "setting.general";
    public static final String SETTING_SEO = "setting.seo";
    public static final String SETTING_TRACKING = "setting.tracking";
    public static final String SETTING_SOCIAL = "setting.social";
    public static final String SETTING_ADS = "setting.ads";
}
