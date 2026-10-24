package com.bargorya.portal.common.util;

import com.bargorya.portal.common.constant.AppConstants;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public final class DateTimeUtils {
    private static final ZoneId UTC_ZONE = ZoneId.of(AppConstants.DEFAULT_TIMEZONE);
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ofPattern(AppConstants.DATE_TIME_FORMAT);
    private static final DateTimeFormatter MONTH_YEAR_FORMATTER = DateTimeFormatter.ofPattern("MMMM yyyy", Locale.ENGLISH);

    private DateTimeUtils() {}

    public static String formatUtc(Instant instant) {
        if (instant == null) return null;
        return ZonedDateTime.ofInstant(instant, UTC_ZONE).format(ISO_FORMATTER);
    }

    public static String getCurrentMonthYearEnglish() {
        return ZonedDateTime.now(UTC_ZONE).format(MONTH_YEAR_FORMATTER);
    }
}
