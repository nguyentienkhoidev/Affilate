package com.heygoodly.portal.modules.subscriber.controller;

import com.heygoodly.portal.common.constant.MessageConstants;
import com.heygoodly.portal.common.dto.ApiResponse;
import com.heygoodly.portal.common.util.NetworkUtils;
import com.heygoodly.portal.modules.subscriber.dto.request.SubscriberRequest;
import com.heygoodly.portal.modules.subscriber.dto.response.SubscriberResponse;
import com.heygoodly.portal.modules.subscriber.service.SubscriberService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/subscribers", "/api/v1/public/subscribers"})
@RequiredArgsConstructor
public class SubscriberPublicController {

    private final SubscriberService subscriberService;

    @PostMapping
    public ResponseEntity<ApiResponse<SubscriberResponse>> subscribe(
            @Valid @RequestBody SubscriberRequest request,
            HttpServletRequest servletRequest
    ) {
        String clientIp = NetworkUtils.getClientIp(servletRequest);
        SubscriberResponse response = subscriberService.subscribe(request, clientIp);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, MessageConstants.SUBSCRIBED_SUCCESS));
    }
}

