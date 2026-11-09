package com.heygoodly.portal.config;

import com.heygoodly.portal.security.CustomAccessDeniedHandler;
import com.heygoodly.portal.security.JwtAuthenticationEntryPoint;
import com.heygoodly.portal.security.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> {})
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .authorizeHttpRequests(auth -> auth
                        // Public auth endpoints
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        // Public portal endpoints
                        .requestMatchers("/api/v1/public/**").permitAll()
                        // Affiliate redirect cloaking endpoints
                        .requestMatchers("/go/**", "/out/**").permitAll()
                        // Static uploads served by Spring during development
                        .requestMatchers("/uploads/**").permitAll()
                        // Public GET endpoints for posts, stores, offers, categories, menus, pages, settings
                        .requestMatchers(HttpMethod.GET, "/api/v1/posts/**", "/api/v1/stores/**", "/api/v1/categories/**", "/api/v1/offers/**", "/api/v1/menus/**", "/api/v1/pages/**", "/api/v1/settings/**").permitAll()
                        // Feedback & Newsletter submission
                        .requestMatchers(HttpMethod.POST, "/api/v1/feedbacks", "/api/v1/subscribers", "/api/v1/public/feedbacks", "/api/v1/public/subscribers").permitAll()
                        // Lightweight container & load-balancer health probes
                        .requestMatchers(HttpMethod.GET, "/actuator/health", "/actuator/info", "/api/v1/public/health").permitAll()
                        // All Admin ProCMS and Profile endpoints strictly require valid JWT authentication
                        .requestMatchers("/api/v1/admin/**", "/api/v1/profile/**").authenticated()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
