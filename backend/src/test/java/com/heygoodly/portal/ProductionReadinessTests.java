package com.heygoodly.portal;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.controller.HealthCheckController;
import com.heygoodly.portal.common.util.NullSafeUtils;
import com.heygoodly.portal.common.util.PaginationUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.config.YamlPropertiesFactoryBean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ProductionReadinessTests {

    @Test
    void nullSafeUtilsPreventsNullPointerExceptions() {
        assertEquals(AppConstants.EMPTY, NullSafeUtils.safeTrim(null));
        assertEquals(AppConstants.EMPTY, NullSafeUtils.safeTrim("   "));
        assertEquals("HeyGoodly", NullSafeUtils.safeTrim("  HeyGoodly  "));
        assertEquals("coupon20", NullSafeUtils.safeLowerTrim("  COUPON20 "));
        assertNull(NullSafeUtils.trimToNull("   "));
        assertFalse(NullSafeUtils.safeBoolean(null));
        assertTrue(NullSafeUtils.safeBoolean(Boolean.TRUE));
        assertEquals(0, NullSafeUtils.safeList(null).size());
        assertEquals(2, NullSafeUtils.safeList(List.of("a", "b")).size());
    }

    @Test
    void paginationUtilsClampsBoundsSafely() {
        Pageable defaultPageable = PaginationUtils.createPageable(-5, 0, null, null);
        assertEquals(0, defaultPageable.getPageNumber());
        assertTrue(defaultPageable.getPageSize() > 0);
        assertNotNull(defaultPageable.getSort().getOrderFor("createdAt"));
        assertEquals(Sort.Direction.DESC, defaultPageable.getSort().getOrderFor("createdAt").getDirection());

        Pageable cappedPageable = PaginationUtils.createPageable(2, 99999, "id", "asc");
        assertEquals(2, cappedPageable.getPageNumber());
        assertTrue(cappedPageable.getPageSize() <= 100);
        assertEquals(Sort.Direction.ASC, cappedPageable.getSort().getOrderFor("id").getDirection());
    }

    @Test
    void healthCheckEndpointReturnsUpStatus() {
        HealthCheckController controller = new HealthCheckController();
        ResponseEntity<Map<String, String>> response = controller.health();
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(AppConstants.STATUS_UP, response.getBody().get(AppConstants.STATUS_KEY));
    }

    @Test
    void applicationProdProfileEnforcesSafetyInvariants() {
        YamlPropertiesFactoryBean yaml = new YamlPropertiesFactoryBean();
        yaml.setResources(new ClassPathResource("application-prod.yml"));
        Properties props = yaml.getObject();

        assertNotNull(props);
        assertEquals(Boolean.FALSE, props.get("spring.jpa.open-in-view"));
        assertEquals(Boolean.FALSE, props.get("spring.liquibase.drop-first"));
        assertEquals("graceful", props.getProperty("server.shutdown"));
        assertEquals("framework", props.getProperty("server.forward-headers-strategy"));
        assertEquals("never", props.getProperty("server.error.include-stacktrace"));
    }
}

