package com.bargorya.portal.common.dto;

import com.bargorya.portal.common.constant.MessageConstants;

import java.time.Instant;

public record ApiResponse<T>(
        boolean success,
        String message,
        T data,
        Instant timestamp
) {
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, MessageConstants.SUCCESS, data, Instant.now());
    }

    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data, Instant.now());
    }

    public static <T> ApiResponse<T> success(T data) {
        return ok(data);
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return ok(message, data);
    }

    public static <T> ApiResponse<T> created(T data) {
        return new ApiResponse<>(true, MessageConstants.CREATED, data, Instant.now());
    }

    public static <T> ApiResponse<T> created(String message, T data) {
        return new ApiResponse<>(true, message, data, Instant.now());
    }
}
