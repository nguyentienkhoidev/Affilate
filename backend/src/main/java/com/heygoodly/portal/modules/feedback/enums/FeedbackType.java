package com.heygoodly.portal.modules.feedback.enums;

public enum FeedbackType {
    GENERAL,
    COUPON_REPORT,
    PARTNERSHIP,
    COUPON_INVALID,
    EDITORIAL_SUGGESTION;

    public static FeedbackType fromString(String val) {
        if (val == null || val.isBlank()) {
            return GENERAL;
        }
        String clean = val.trim().toLowerCase();
        return switch (clean) {
            case "coupon_invalid", "coupon_report" -> COUPON_REPORT;
            case "editorial_suggestion" -> EDITORIAL_SUGGESTION;
            case "partnership" -> PARTNERSHIP;
            default -> {
                try {
                    yield FeedbackType.valueOf(val.trim().toUpperCase());
                } catch (IllegalArgumentException e) {
                    yield GENERAL;
                }
            }
        };
    }
}

