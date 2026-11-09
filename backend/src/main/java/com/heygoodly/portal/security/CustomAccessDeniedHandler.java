package com.heygoodly.portal.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heygoodly.portal.common.dto.ApiResponse;
import com.heygoodly.portal.common.exception.ErrorCode;
import com.heygoodly.portal.common.i18n.service.I18nService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;
    private final I18nService i18nService;

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException
    ) throws IOException {
        ErrorCode errorCode = ErrorCode.ACCESS_DENIED;
        String message = i18nService.getMessage(errorCode.getI18nKey(), errorCode.getDefaultMessage());

        log.warn("Access denied to [{} {}]: {}", request.getMethod(), request.getRequestURI(), message);

        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        ApiResponse<Void> apiResponse = ApiResponse.error(errorCode.name(), message);
        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }
}

