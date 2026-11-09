package com.heygoodly.portal.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // General & System Errors
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "error.internal_server_error", "An unexpected system error occurred."),
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "error.validation_failed", "Invalid request payload."),
    VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "error.validation_failed", "Validation failed for one or more fields."),

    // Security & Authentication Errors
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "error.unauthorized", "Authentication is required to access this resource."),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "error.access_denied", "You do not have permission to perform this action."),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "error.invalid_credentials", "Invalid email or password."),
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "error.token_expired", "Session token has expired. Please refresh your session."),
    TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "error.token_invalid", "Invalid authentication token. Please sign in again."),
    TOKEN_REVOKED(HttpStatus.UNAUTHORIZED, "error.token_revoked", "This session has been logged out or revoked. Please sign in again."),
    TOKEN_MISSING(HttpStatus.UNAUTHORIZED, "error.token_missing", "Authentication token is required."),
    TWO_FACTOR_REQUIRED(HttpStatus.UNAUTHORIZED, "error.two_factor_required", "Two-factor authentication code is required."),
    INVALID_OTP_CODE(HttpStatus.BAD_REQUEST, "error.invalid_otp_code", "Invalid or expired 2FA verification code."),
    ACCOUNT_LOCKED(HttpStatus.FORBIDDEN, "error.account_locked", "Account is temporarily locked due to too many failed attempts."),

    // Domain & Entity Errors
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "error.resource_not_found", "Requested resource was not found."),
    STORE_NOT_FOUND(HttpStatus.NOT_FOUND, "error.store_not_found", "Store does not exist."),
    OFFER_NOT_FOUND(HttpStatus.NOT_FOUND, "error.offer_not_found", "Offer coupon does not exist."),
    POST_NOT_FOUND(HttpStatus.NOT_FOUND, "error.post_not_found", "Editorial post does not exist."),
    SUBSCRIBER_NOT_FOUND(HttpStatus.NOT_FOUND, "error.subscriber_not_found", "Subscriber does not exist."),
    AUDIT_LOG_NOT_FOUND(HttpStatus.NOT_FOUND, "error.audit_log_not_found", "Audit log record does not exist."),
    DUPLICATE_RESOURCE(HttpStatus.CONFLICT, "error.duplicate_resource", "Resource with given unique identifier already exists."),

    // File Storage Errors
    FILE_UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "error.file_upload_failed", "Failed to upload file to storage."),
    INVALID_FILE_TYPE(HttpStatus.BAD_REQUEST, "error.invalid_file_type", "The uploaded file format is not supported.");

    private final HttpStatus httpStatus;
    private final String i18nKey;
    private final String defaultMessage;

    ErrorCode(HttpStatus httpStatus, String i18nKey, String defaultMessage) {
        this.httpStatus = httpStatus;
        this.i18nKey = i18nKey;
        this.defaultMessage = defaultMessage;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public String getI18nKey() {
        return i18nKey;
    }

    public String getDefaultMessage() {
        return defaultMessage;
    }
}

