package com.bargorya.portal.common.exception;

import com.bargorya.portal.common.constant.ErrorCodes;
import org.springframework.http.HttpStatus;

public class UnauthorizedException extends DomainException {
    public UnauthorizedException(String message) {
        super(message, HttpStatus.UNAUTHORIZED, ErrorCodes.UNAUTHORIZED);
    }
}
