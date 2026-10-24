package com.bargorya.portal.common.exception;

import com.bargorya.portal.common.constant.ErrorCodes;
import org.springframework.http.HttpStatus;

public class DuplicateResourceException extends DomainException {
    public DuplicateResourceException(String resourceName, String fieldName, Object fieldValue) {
        super(
                String.format("%s already exists with %s: '%s'", resourceName, fieldName, fieldValue),
                HttpStatus.CONFLICT,
                ErrorCodes.DUPLICATE_RESOURCE
        );
    }

    public DuplicateResourceException(String message) {
        super(message, HttpStatus.CONFLICT, ErrorCodes.DUPLICATE_RESOURCE);
    }
}
