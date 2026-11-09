package com.heygoodly.portal.modules.feedback.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class FeedbackTypeConverter implements AttributeConverter<FeedbackType, String> {

    @Override
    public String convertToDatabaseColumn(FeedbackType attribute) {
        if (attribute == null) {
            return "general";
        }
        return attribute.name().toLowerCase();
    }

    @Override
    public FeedbackType convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return FeedbackType.GENERAL;
        }
        return FeedbackType.fromString(dbData);
    }
}

