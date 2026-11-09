package com.heygoodly.portal.common.i18n.service.impl;

import com.heygoodly.portal.common.i18n.service.I18nService;
import org.springframework.context.support.AbstractMessageSource;

import java.text.MessageFormat;
import java.util.Locale;

/**
 * Spring MessageSource adapter connecting Spring Framework & Jakarta Bean Validation
 * directly to the PostgreSQL i18n_messages table via I18nService.
 */
public class DatabaseMessageSource extends AbstractMessageSource {

    private final I18nService i18nService;

    public DatabaseMessageSource(I18nService i18nService) {
        this.i18nService = i18nService;
        setUseCodeAsDefaultMessage(true);
    }

    @Override
    protected MessageFormat resolveCode(String code, Locale locale) {
        if (code.isBlank()) {
            return null;
        }
        String msg = i18nService.getMessage(code, locale, null);
        if (msg == null) {
            return null;
        }
        return new MessageFormat(msg, locale);
    }

    @Override
    protected String resolveCodeWithoutArguments(String code, Locale locale) {
        if (code.isBlank()) {
            return null;
        }
        return i18nService.getMessage(code, locale, null);
    }
}

