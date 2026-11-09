package com.heygoodly.portal.modules.audit.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum AuditSeverity {
    INFO("info"),
    SUCCESS("success"),
    WARNING("warning"),
    DANGER("danger");

    private final String value;

    AuditSeverity(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static AuditSeverity fromValue(String value) {
        if (value == null || value.isBlank()) {
            return INFO;
        }
        for (AuditSeverity severity : values()) {
            if (severity.value.equalsIgnoreCase(value.trim()) || severity.name().equalsIgnoreCase(value.trim())) {
                return severity;
            }
        }
        return INFO;
    }
}

