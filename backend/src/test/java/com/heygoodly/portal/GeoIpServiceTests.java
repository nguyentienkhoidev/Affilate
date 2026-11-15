package com.heygoodly.portal;

import com.heygoodly.portal.modules.setting.service.GeoIpService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GeoIpServiceTests {

    @Test
    void extractsFirstPublicIpSkippingPrivateAndLoopback() {
        GeoIpService service = new GeoIpService("non-existent-path/GeoLite2-Country.mmdb");
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Forwarded-For", "127.0.0.1, 10.0.0.5, 8.8.8.8, 172.17.0.2");
        request.setRemoteAddr("192.168.1.10");

        assertEquals("8.8.8.8", service.extractPublicClientIp(request));
    }

    @Test
    void fallsBackGracefullyWhenDatabaseMissing() {
        GeoIpService service = new GeoIpService("non-existent-path/GeoLite2-Country.mmdb");
        service.init();

        assertFalse(service.isDatabaseLoaded());
        assertTrue(service.resolveCountryByIp("8.8.8.8").isEmpty());
        assertTrue(service.resolveCountryByIp("127.0.0.1").isEmpty());
    }
}
