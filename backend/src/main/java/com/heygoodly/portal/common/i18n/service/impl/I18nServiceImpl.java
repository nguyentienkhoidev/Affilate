package com.heygoodly.portal.common.i18n.service.impl;

import com.heygoodly.portal.common.i18n.entity.I18nMessageEntity;
import com.heygoodly.portal.common.i18n.repository.I18nMessageRepository;
import com.heygoodly.portal.common.i18n.service.I18nService;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class I18nServiceImpl implements I18nService {

    private final I18nMessageRepository repository;

    /**
     * Bounded in-memory thread-safe cache by message key.
     */
    private final Map<String, I18nMessageEntity> messageCache = new ConcurrentHashMap<>(256);

    /**
     * Secondary lookup cache by exact English text to translate static annotations / error text.
     */
    private final Map<String, I18nMessageEntity> englishTextCache = new ConcurrentHashMap<>(256);

    @PostConstruct
    public void init() {
        refreshCache();
    }

    /**
     * Periodically syncs translations from database every 15 minutes.
     */
    @Override
    @Scheduled(fixedRate = 900000)
    public synchronized void refreshCache() {
        try {
            List<I18nMessageEntity> allMessages = repository.findAll();
            messageCache.clear();
            englishTextCache.clear();
            for (I18nMessageEntity entity : allMessages) {
                if (entity.getMessageKey() != null) {
                    String cleanKey = entity.getMessageKey().trim();
                    messageCache.put(cleanKey, entity);
                    // Also store with braces for Jakarta Validation lookup
                    messageCache.put("{" + cleanKey + "}", entity);
                }
                if (entity.getMessageEn() != null && !entity.getMessageEn().isBlank()) {
                    englishTextCache.put(entity.getMessageEn().trim().toLowerCase(Locale.ROOT), entity);
                }
            }
            log.info("I18n translation cache loaded successfully with {} entries.", allMessages.size());
        } catch (Exception e) {
            log.warn("Failed to sync I18n cache from database: {}", e.getMessage());
        }
    }

    @Override
    public String getMessage(String messageKey) {
        return getMessage(messageKey, resolveCurrentLocale(), messageKey);
    }

    @Override
    public String getMessage(String messageKey, String defaultMessage) {
        return getMessage(messageKey, resolveCurrentLocale(), defaultMessage);
    }

    @Override
    public String getMessage(String messageKey, Locale locale, String defaultMessage) {
        if (messageKey == null || messageKey.isBlank()) {
            return defaultMessage;
        }

        Locale targetLocale = locale != null ? locale : resolveCurrentLocale();
        String trimmed = messageKey.trim();
        final String lookupKey = (trimmed.startsWith("{") && trimmed.endsWith("}") && trimmed.length() > 2)
                ? trimmed.substring(1, trimmed.length() - 1).trim()
                : trimmed;

        // 1. Check primary key cache
        I18nMessageEntity entity = messageCache.get(lookupKey);

        // 2. Check English raw message cache
        if (entity == null) {
            entity = englishTextCache.get(lookupKey.toLowerCase(Locale.ROOT));
        }

        // 3. Lazy load from PostgreSQL database if not present in memory cache
        if (entity == null) {
            entity = repository.findByMessageKey(lookupKey)
                    .or(() -> repository.findByMessageEnIgnoreCase(lookupKey))
                    .map(found -> {
                        messageCache.put(found.getMessageKey(), found);
                        messageCache.put("{" + found.getMessageKey() + "}", found);
                        if (found.getMessageEn() != null) {
                            englishTextCache.put(found.getMessageEn().trim().toLowerCase(Locale.ROOT), found);
                        }
                        return found;
                    })
                    .orElse(null);
        }

        if (entity == null) {
            return defaultMessage;
        }

        boolean isVietnamese = targetLocale != null && "vi".equalsIgnoreCase(targetLocale.getLanguage());
        return isVietnamese ? entity.getMessageVi() : entity.getMessageEn();
    }

    /**
     * Resolves the current request's target locale proactively from HTTP request headers.
     */
    private Locale resolveCurrentLocale() {
        try {
            RequestAttributes attribs = RequestContextHolder.getRequestAttributes();
            if (attribs instanceof ServletRequestAttributes servletAttribs) {
                HttpServletRequest req = servletAttribs.getRequest();
                String xLocale = req.getHeader("X-Locale");
                if (xLocale != null && !xLocale.isBlank()) {
                    return Locale.of(xLocale.trim().toLowerCase(Locale.ROOT));
                }
                String acceptLang = req.getHeader("Accept-Language");
                if (acceptLang != null && !acceptLang.isBlank()) {
                    String primaryLang = acceptLang.split("[,;]")[0].trim().split("-")[0].toLowerCase(Locale.ROOT);
                    return Locale.of(primaryLang);
                }
            }
        } catch (Exception ignored) {
            // fallback
        }
        return LocaleContextHolder.getLocale();
    }
}

