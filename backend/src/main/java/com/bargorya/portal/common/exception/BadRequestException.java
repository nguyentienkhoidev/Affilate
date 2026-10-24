package com.bargorya.portal.common.exception;

import com.bargorya.portal.common.constant.ErrorCodes;
import org.springframework.http.HttpStatus;

public class BadRequestException extends DomainException {
    public BadRequestException(String message) {
        super(message, HttpStatus.BAD_REQUEST, ErrorCodes.BAD_REQUEST);
    }

    public BadRequestException(String message, String errorCode) {
        super(message, HttpStatus.BAD_REQUEST, errorCode);
    }
}
