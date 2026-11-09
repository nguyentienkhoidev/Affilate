package com.heygoodly.portal.common.i18n.service;

import java.util.Locale;

public interface I18nService {

    /**
     * Resolves localized message for the current request's locale.
     * Current locale is extracted safely from Spring's LocaleContextHolder.
     *
     * @param messageKey key in i18n_messages (e.g. error.not_found)
     * @return localized message (English or Vietnamese)
     */
    String getMessage(String messageKey);

    /**
     * Resolves localized message with a fallback default string.
     *
     * @param messageKey key in i18n_messages
     * @param defaultMessage fallback message if key is not found
     * @return localized message or defaultMessage
     */
    String getMessage(String messageKey, String defaultMessage);

    /**
     * Resolves localized message for an explicit target locale.
     *
     * @param messageKey key in i18n_messages
     * @param locale target Locale (en or vi)
     * @param defaultMessage fallback message if key is not found
     * @return localized message
     */
    String getMessage(String messageKey, Locale locale, String defaultMessage);

    /**
     * Flushes and re-syncs the translation cache from database.
     * Callable by Admin in ProCMS without restarting the application server.
     */
    void refreshCache();
}

