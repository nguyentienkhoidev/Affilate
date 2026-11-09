package com.heygoodly.portal.security;

import com.heygoodly.portal.common.constant.SecurityConstants;
import com.heygoodly.portal.common.exception.ErrorCode;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;
    private final CustomUserDetailsService userDetailsService;
    private final TokenBlacklistService tokenBlacklistService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader(SecurityConstants.TOKEN_HEADER);
        String jwt = extractJwtFromRequest(request);

        if (StringUtils.hasText(jwt)) {
            JwtProvider.JwtStatus status = jwtProvider.validateTokenDetailed(jwt);
            switch (status) {
                case VALID -> {
                    // Check Redis token revocation blacklist
                    if (tokenBlacklistService.isTokenBlacklisted(jwt)) {
                        log.warn("Revoked/blacklisted token used for [{}]", request.getRequestURI());
                        request.setAttribute(SecurityConstants.AUTH_ERROR_ATTRIBUTE, ErrorCode.TOKEN_REVOKED);
                        break;
                    }

                    try {
                        String email = jwtProvider.getEmailFromToken(jwt);
                        Long userId = jwtProvider.getUserIdFromToken(jwt);
                        java.util.Date issuedAt = jwtProvider.getIssuedAtFromToken(jwt);

                        if (userId != null && issuedAt != null && tokenBlacklistService.isUserTokenRevoked(userId, issuedAt.getTime())) {
                            log.warn("User tokens revoked prior to timestamp for userId [{}]", userId);
                            request.setAttribute(SecurityConstants.AUTH_ERROR_ATTRIBUTE, ErrorCode.TOKEN_REVOKED);
                            break;
                        }

                        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                        if (userDetails.isEnabled()) {
                            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );
                            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                        } else {
                            log.warn("Authenticated user [{}] is disabled or locked.", email);
                            request.setAttribute(SecurityConstants.AUTH_ERROR_ATTRIBUTE, ErrorCode.ACCOUNT_LOCKED);
                        }
                    } catch (Exception ex) {
                        log.error("Could not set user authentication in security context: {}", ex.getMessage());
                        request.setAttribute(SecurityConstants.AUTH_ERROR_ATTRIBUTE, ErrorCode.UNAUTHORIZED);
                    }
                }
                case EXPIRED -> {
                    log.debug("JWT token is expired for request [{}]", request.getRequestURI());
                    request.setAttribute(SecurityConstants.AUTH_ERROR_ATTRIBUTE, ErrorCode.TOKEN_EXPIRED);
                }
                case INVALID_SIGNATURE, MALFORMED, UNSUPPORTED -> {
                    log.warn("JWT token invalid or tampered [{}] for request [{}]", status, request.getRequestURI());
                    request.setAttribute(SecurityConstants.AUTH_ERROR_ATTRIBUTE, ErrorCode.TOKEN_INVALID);
                }
                case EMPTY -> {
                    request.setAttribute(SecurityConstants.AUTH_ERROR_ATTRIBUTE, ErrorCode.TOKEN_MISSING);
                }
            }
        } else if (StringUtils.hasText(authHeader)) {
            // Header present but malformed (e.g. missing "Bearer " prefix)
            log.warn("Malformed Authorization header: [{}]", authHeader);
            request.setAttribute(SecurityConstants.AUTH_ERROR_ATTRIBUTE, ErrorCode.TOKEN_INVALID);
        } else {
            // No token at all
            request.setAttribute(SecurityConstants.AUTH_ERROR_ATTRIBUTE, ErrorCode.TOKEN_MISSING);
        }

        filterChain.doFilter(request, response);
    }

    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(SecurityConstants.TOKEN_HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(SecurityConstants.TOKEN_PREFIX)) {
            return bearerToken.substring(SecurityConstants.TOKEN_PREFIX.length()).trim();
        }
        return null;
    }
}
