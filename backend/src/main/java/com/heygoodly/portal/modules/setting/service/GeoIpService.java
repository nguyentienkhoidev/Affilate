package com.heygoodly.portal.modules.setting.service;

import com.heygoodly.portal.common.util.NullSafeUtils;
import com.maxmind.db.CHMCache;
import com.maxmind.geoip2.DatabaseReader;
import com.maxmind.geoip2.exception.AddressNotFoundException;
import com.maxmind.geoip2.model.CountryResponse;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * In-memory MaxMind GeoLite2 Country lookup service with automatic file reload
 * and graceful fallback when no .mmdb database file is mounted.
 */
@Slf4j
@Service
public class GeoIpService {

    private static final String HEADER_X_FORWARDED_FOR = "X-Forwarded-For";
    private static final String HEADER_X_REAL_IP = "X-Real-IP";
    private static final String COMMA = ",";
    private static final String CODE_UK = "UK";
    private static final String CODE_GB = "GB";
    private static final String FALLBACK_PARENT_PREFIX = "../";

    private final String configuredDbPath;

    private volatile DatabaseReader reader;
    private volatile long loadedFileModifiedAt = -1L;
    private volatile File activeDbFile;

    public GeoIpService(
            @Value("${app.geoip.db-path:deploy/geoip/GeoLite2-Country.mmdb}") String configuredDbPath
    ) {
        this.configuredDbPath = NullSafeUtils.safeTrim(configuredDbPath);
    }

    @PostConstruct
    public void init() {
        reloadIfNeeded();
    }

    @PreDestroy
    public void destroy() {
        closeReaderQuietly(this.reader);
        this.reader = null;
    }

    /**
     * Resolves an ISO 3166-1 alpha-2 country code from the HTTP request's public client IP.
     */
    public Optional<String> resolveCountry(HttpServletRequest request) {
        if (request == null) {
            return Optional.empty();
        }
        String clientIp = extractPublicClientIp(request);
        if (clientIp.isEmpty()) {
            return Optional.empty();
        }
        return resolveCountryByIp(clientIp);
    }

    /**
     * Resolves an ISO 3166-1 alpha-2 country code for an explicit IP string.
     */
    public Optional<String> resolveCountryByIp(String ipAddress) {
        String trimmedIp = NullSafeUtils.safeTrim(ipAddress);
        if (trimmedIp.isEmpty()) {
            return Optional.empty();
        }

        reloadIfNeeded();
        DatabaseReader activeReader = this.reader;
        if (activeReader == null) {
            return Optional.empty();
        }

        try {
            InetAddress inetAddress = InetAddress.getByName(trimmedIp);
            if (!isPublicRoutableAddress(inetAddress)) {
                return Optional.empty();
            }
            CountryResponse response = activeReader.country(inetAddress);
            if (response == null || response.getCountry() == null) {
                return Optional.empty();
            }
            String isoCode = NullSafeUtils.safeTrim(response.getCountry().getIsoCode()).toUpperCase(Locale.ROOT);
            if (isoCode.isEmpty()) {
                return Optional.empty();
            }
            return Optional.of(CODE_UK.equals(isoCode) ? CODE_GB : isoCode);
        } catch (AddressNotFoundException ignored) {
            return Optional.empty();
        } catch (Exception ex) {
            log.debug("MaxMind GeoIP lookup skipped for IP {}: {}", trimmedIp, ex.getMessage());
            return Optional.empty();
        }
    }

    public boolean isDatabaseLoaded() {
        return this.reader != null;
    }

    /**
     * Extracts the first publicly routable IP address from X-Forwarded-For, X-Real-IP, or remoteAddr.
     */
    public String extractPublicClientIp(HttpServletRequest request) {
        String xff = NullSafeUtils.safeTrim(request.getHeader(HEADER_X_FORWARDED_FOR));
        if (!xff.isEmpty()) {
            String[] parts = xff.split(COMMA);
            for (String part : parts) {
                String candidate = NullSafeUtils.safeTrim(part);
                if (isPublicIpString(candidate)) {
                    return candidate;
                }
            }
        }

        String realIp = NullSafeUtils.safeTrim(request.getHeader(HEADER_X_REAL_IP));
        if (isPublicIpString(realIp)) {
            return realIp;
        }

        String remoteAddr = NullSafeUtils.safeTrim(request.getRemoteAddr());
        return isPublicIpString(remoteAddr) ? remoteAddr : "";
    }

    private synchronized void reloadIfNeeded() {
        File candidate = resolveExistingDbFile();
        if (candidate == null) {
            if (this.reader != null) {
                closeReaderQuietly(this.reader);
                this.reader = null;
                this.activeDbFile = null;
                this.loadedFileModifiedAt = -1L;
            }
            return;
        }

        long modifiedAt = candidate.lastModified();
        if (this.reader != null && candidate.equals(this.activeDbFile) && modifiedAt == this.loadedFileModifiedAt) {
            return;
        }

        try {
            DatabaseReader nextReader = new DatabaseReader.Builder(candidate)
                    .withCache(new CHMCache())
                    .build();
            DatabaseReader previous = this.reader;
            this.reader = nextReader;
            this.activeDbFile = candidate;
            this.loadedFileModifiedAt = modifiedAt;
            closeReaderQuietly(previous);
            log.info("Loaded MaxMind GeoLite2 database from {}", candidate.getAbsolutePath());
        } catch (IOException ex) {
            log.warn("Failed to load MaxMind GeoLite2 database from {}: {}", candidate.getAbsolutePath(), ex.getMessage());
        }
    }

    private File resolveExistingDbFile() {
        if (configuredDbPath.isEmpty()) {
            return null;
        }
        StringBuilder parentRelative = new StringBuilder(FALLBACK_PARENT_PREFIX).append(configuredDbPath);
        List<File> candidates = List.of(
                new File(configuredDbPath),
                new File(parentRelative.toString())
        );
        for (File file : candidates) {
            if (file.isFile() && file.canRead()) {
                return file;
            }
        }
        return null;
    }

    private static boolean isPublicIpString(String candidate) {
        if (candidate.isEmpty()) {
            return false;
        }
        try {
            InetAddress addr = InetAddress.getByName(candidate);
            return isPublicRoutableAddress(addr);
        } catch (UnknownHostException ex) {
            return false;
        }
    }

    private static boolean isPublicRoutableAddress(InetAddress addr) {
        return !addr.isAnyLocalAddress()
                && !addr.isLoopbackAddress()
                && !addr.isLinkLocalAddress()
                && !addr.isSiteLocalAddress()
                && !addr.isMulticastAddress();
    }

    private static void closeReaderQuietly(DatabaseReader target) {
        if (target != null) {
            try {
                target.close();
            } catch (IOException ignored) {
                // Ignore close failure on reload/shutdown
            }
        }
    }
}
