package com.bargorya.portal.common.exception;

import com.bargorya.portal.common.constant.ErrorCodes;
import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends DomainException {
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(
                String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue),
                HttpStatus.NOT_FOUND,
                ErrorCodes.RESOURCE_NOT_FOUND
        );
    }

    public ResourceNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND, ErrorCodes.RESOURCE_NOT_FOUND);
    }
}
