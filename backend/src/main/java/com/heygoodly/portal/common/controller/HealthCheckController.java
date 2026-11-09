package com.heygoodly.portal.common.controller;

import com.heygoodly.portal.common.constant.AppConstants;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthCheckController {

    @GetMapping({"/actuator/health", "/api/v1/public/health"})
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                AppConstants.STATUS_KEY, AppConstants.STATUS_UP
        ));
    }
}

