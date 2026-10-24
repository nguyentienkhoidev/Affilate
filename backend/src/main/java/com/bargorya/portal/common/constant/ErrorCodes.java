package com.bargorya.portal.common.constant;

public final class ErrorCodes {
    private ErrorCodes() {}

    public static final String INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR";
    public static final String BAD_REQUEST = "BAD_REQUEST";
    public static final String VALIDATION_FAILED = "VALIDATION_FAILED";
    public static final String UNAUTHORIZED = "UNAUTHORIZED";
    public static final String ACCESS_DENIED = "ACCESS_DENIED";
    public static final String RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND";
    public static final String DUPLICATE_RESOURCE = "DUPLICATE_RESOURCE";
    public static final String INVALID_CREDENTIALS = "INVALID_CREDENTIALS";
    public static final String ACCOUNT_LOCKED = "ACCOUNT_LOCKED";
    public static final String TWO_FACTOR_REQUIRED = "TWO_FACTOR_REQUIRED";
    public static final String INVALID_OTP_CODE = "INVALID_OTP_CODE";
    public static final String FILE_UPLOAD_FAILED = "FILE_UPLOAD_FAILED";
    public static final String INVALID_FILE_TYPE = "INVALID_FILE_TYPE";
    public static final String FILE_TOO_LARGE = "FILE_TOO_LARGE";
}
