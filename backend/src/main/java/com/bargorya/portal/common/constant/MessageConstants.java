package com.bargorya.portal.common.constant;

public final class MessageConstants {
    private MessageConstants() {}

    public static final String SUCCESS = "Operation completed successfully.";
    public static final String CREATED = "Resource created successfully.";
    public static final String UPDATED = "Resource updated successfully.";
    public static final String DELETED = "Resource deleted successfully.";
    
    public static final String CREATED_SUCCESS = CREATED;
    public static final String UPDATED_SUCCESS = UPDATED;
    public static final String DELETED_SUCCESS = DELETED;

    public static final String LOGIN_SUCCESS = "Login successful.";
    public static final String TWO_FACTOR_REQUIRED = "Two-factor authentication code is required.";
    public static final String TWO_FACTOR_ENABLED = "Two-factor authentication has been successfully enabled.";
    public static final String TWO_FACTOR_DISABLED = "Two-factor authentication has been disabled.";
    public static final String TWO_FACTOR_RESET = "Two-factor authentication has been reset for the user.";
}
