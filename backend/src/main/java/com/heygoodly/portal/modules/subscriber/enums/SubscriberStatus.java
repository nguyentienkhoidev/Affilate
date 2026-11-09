package com.heygoodly.portal.modules.subscriber.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum SubscriberStatus {
    ACTIVE("active"),
    UNSUBSCRIBED("unsubscribed"),
    BANNED("banned");

    private final String value;

    SubscriberStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static SubscriberStatus fromValue(String value) {
        if (value == null || value.isBlank()) {
            return ACTIVE;
        }
        for (SubscriberStatus status : values()) {
            if (status.value.equalsIgnoreCase(value.trim()) || status.name().equalsIgnoreCase(value.trim())) {
                return status;
            }
        }
        return ACTIVE;
    }
}

