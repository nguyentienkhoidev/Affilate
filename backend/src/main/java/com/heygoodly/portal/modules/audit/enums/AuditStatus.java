package com.heygoodly.portal.modules.audit.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum AuditStatus {
    SUCCESS("SUCCESS"),
    FAILED("FAILED"),
    WARNING("WARNING");

    private final String value;

    AuditStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static AuditStatus fromValue(String value) {
        if (value == null || value.isBlank()) {
            return SUCCESS;
        }
        for (AuditStatus status : values()) {
            if (status.value.equalsIgnoreCase(value.trim()) || status.name().equalsIgnoreCase(value.trim())) {
                return status;
            }
        }
        return SUCCESS;
    }
}

