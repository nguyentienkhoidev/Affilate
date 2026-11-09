package com.heygoodly.portal.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heygoodly.portal.common.constant.SecurityConstants;
import com.heygoodly.portal.common.dto.ApiResponse;
import com.heygoodly.portal.common.exception.ErrorCode;
import com.heygoodly.portal.common.i18n.service.I18nService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;
    private final I18nService i18nService;

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException {
        ErrorCode errorCode = (ErrorCode) request.getAttribute(SecurityConstants.AUTH_ERROR_ATTRIBUTE);
        if (errorCode == null) {
            errorCode = ErrorCode.UNAUTHORIZED;
        }

        String message = i18nService.getMessage(errorCode.getI18nKey(), errorCode.getDefaultMessage());

        log.warn("Unauthorized access to [{} {}]: [{}] - {}",
                request.getMethod(), request.getRequestURI(), errorCode.name(), message);

        response.setStatus(errorCode.getHttpStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        ApiResponse<Void> apiResponse = ApiResponse.error(errorCode.name(), message);
        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }
}

