package com.heygoodly.portal.modules.setting.controller;

import com.heygoodly.portal.common.dto.ApiResponse;
import com.heygoodly.portal.common.util.NullSafeUtils;
import com.heygoodly.portal.modules.setting.dto.response.SettingResponse;
import com.heygoodly.portal.modules.setting.service.GeoIpService;
import com.heygoodly.portal.modules.setting.service.SettingService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping({"/api/v1/settings", "/api/v1/public/settings"})
@RequiredArgsConstructor
public class SettingPublicController {

    private static final String HEADER_CF_IPCOUNTRY = "CF-IPCountry";
    private static final String HEADER_VERCEL_COUNTRY = "X-Vercel-IP-Country";
    private static final String HEADER_COUNTRY_CODE = "X-Country-Code";
    private static final String HEADER_GEO_COUNTRY = "X-Geo-Country";
    private static final String CODE_GLOBAL = "GLOBAL";
    private static final String CODE_UNKNOWN_CF = "XX";
    private static final String CODE_TOR_CF = "T1";
    private static final String SOURCE_QUERY = "query";
    private static final String SOURCE_CF = "cloudflare";
    private static final String SOURCE_HEADER = "header";
    private static final String SOURCE_MAXMIND = "maxmind";
    private static final String SOURCE_FALLBACK = "fallback";
    private static final String DEFAULT_TIMEZONE = "UTC";

    private static final Map<String, String> COUNTRY_TIMEZONES = Map.ofEntries(
            Map.entry("US", "America/New_York"),
            Map.entry("GB", "Europe/London"),
            Map.entry("CA", "America/Toronto"),
            Map.entry("FR", "Europe/Paris"),
            Map.entry("DE", "Europe/Berlin"),
            Map.entry("AU", "Australia/Sydney"),
            Map.entry("JP", "Asia/Tokyo"),
            Map.entry("KR", "Asia/Seoul"),
            Map.entry("SG", "Asia/Singapore"),
            Map.entry("VN", "Asia/Ho_Chi_Minh"),
            Map.entry("NZ", "Pacific/Auckland"),
            Map.entry("NL", "Europe/Amsterdam"),
            Map.entry("ES", "Europe/Madrid"),
            Map.entry("IT", "Europe/Rome"),
            Map.entry("SE", "Europe/Stockholm"),
            Map.entry("IN", "Asia/Kolkata"),
            Map.entry("BR", "America/Sao_Paulo"),
            Map.entry("MX", "America/Mexico_City"),
            Map.entry("AE", "Asia/Dubai")
    );

    private static final Set<String> IGNORED_COUNTRY_CODES = Set.of(CODE_UNKNOWN_CF, CODE_TOR_CF);

    private final SettingService settingService;
    private final GeoIpService geoIpService;

    @GetMapping({"/public", ""})
    public ResponseEntity<ApiResponse<SettingResponse>> getPublicSettings() {
        return ResponseEntity.ok(ApiResponse.success(settingService.getPublicSettings()));
    }

    /**
     * Resolves visitor country code and canonical timezone in priority order:
     * 1. ?country=XX preview param
     * 2. Cloudflare CF-IPCountry header
     * 3. Proxy country headers (X-Vercel-IP-Country, X-Country-Code, X-Geo-Country)
     * 4. Local MaxMind GeoLite2 .mmdb lookup using client public IP
     * 5. GLOBAL fallback (allows frontend timezone fallback)
     */
    @GetMapping("/geo")
    public ResponseEntity<ApiResponse<Map<String, String>>> getVisitorGeo(
            @RequestParam(value = "country", required = false) String queryCountry,
            HttpServletRequest request
    ) {
        String source = SOURCE_FALLBACK;
        String resolvedCode = normalizeCountryCode(queryCountry);

        if (!resolvedCode.isEmpty()) {
            source = SOURCE_QUERY;
        } else {
            String cfCountry = normalizeCountryCode(request.getHeader(HEADER_CF_IPCOUNTRY));
            if (!cfCountry.isEmpty()) {
                resolvedCode = cfCountry;
                source = SOURCE_CF;
            } else {
                String headerCountry = firstNonEmptyCountry(
                        request.getHeader(HEADER_VERCEL_COUNTRY),
                        request.getHeader(HEADER_COUNTRY_CODE),
                        request.getHeader(HEADER_GEO_COUNTRY)
                );
                if (!headerCountry.isEmpty()) {
                    resolvedCode = headerCountry;
                    source = SOURCE_HEADER;
                } else {
                    Optional<String> maxmindCountry = geoIpService.resolveCountry(request);
                    if (maxmindCountry.isPresent()) {
                        resolvedCode = maxmindCountry.get();
                        source = SOURCE_MAXMIND;
                    } else {
                        resolvedCode = CODE_GLOBAL;
                    }
                }
            }
        }

        String timezone = COUNTRY_TIMEZONES.getOrDefault(resolvedCode, DEFAULT_TIMEZONE);
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put("countryCode", resolvedCode);
        payload.put("timezone", timezone);
        payload.put("source", source);
        return ResponseEntity.ok(ApiResponse.success(payload));
    }

    private static String firstNonEmptyCountry(String... candidates) {
        for (String candidate : candidates) {
            String normalized = normalizeCountryCode(candidate);
            if (!normalized.isEmpty()) {
                return normalized;
            }
        }
        return "";
    }

    private static String normalizeCountryCode(String raw) {
        String trimmed = NullSafeUtils.safeTrim(raw).toUpperCase(Locale.ROOT);
        if (trimmed.isEmpty() || IGNORED_COUNTRY_CODES.contains(trimmed)) {
            return "";
        }
        if ("UK".equals(trimmed)) {
            return "GB";
        }
        return trimmed;
    }
}
