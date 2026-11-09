package com.heygoodly.portal.modules.audit.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum AuditAction {
    CREATE("CREATE"),
    UPDATE("UPDATE"),
    DELETE("DELETE"),
    PUBLISH("PUBLISH"),
    CLONE("CLONE"),
    RBAC_CHANGE("RBAC_CHANGE"),
    SECURITY("SECURITY"),
    LOGIN("LOGIN"),
    MEDIA_UPLOAD("MEDIA_UPLOAD"),
    SETTINGS_CHANGE("SETTINGS_CHANGE");

    private final String value;

    AuditAction(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static AuditAction fromValue(String value) {
        if (value == null || value.isBlank()) {
            return UPDATE;
        }
        for (AuditAction action : values()) {
            if (action.value.equalsIgnoreCase(value.trim()) || action.name().equalsIgnoreCase(value.trim())) {
                return action;
            }
        }
        return UPDATE;
    }
}

