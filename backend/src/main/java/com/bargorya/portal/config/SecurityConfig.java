package com.bargorya.portal.config;

import com.bargorya.portal.security.JwtFilter;
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
                .authorizeHttpRequests(auth -> auth
                        // Public auth endpoints
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        // Public portal endpoints
                        .requestMatchers("/api/v1/public/**").permitAll()
                        // Affiliate redirect cloaking endpoints
                        .requestMatchers("/go/**", "/out/**").permitAll()
                        // Static uploads served by Spring during development
                        .requestMatchers("/uploads/**").permitAll()
                        // Public GET endpoints for posts, stores, offers
                        .requestMatchers(HttpMethod.GET, "/api/v1/posts/**", "/api/v1/stores/**", "/api/v1/categories/**", "/api/v1/offers/**").permitAll()
                        // Feedback submission
                        .requestMatchers(HttpMethod.POST, "/api/v1/feedbacks").permitAll()
                        // Actuator health check
                        .requestMatchers("/actuator/**").permitAll()
                        // All admin endpoints require authentication
                        .requestMatchers("/api/v1/admin/**").authenticated()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
