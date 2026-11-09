package com.heygoodly.portal.modules.subscriber.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriberResponse {
    private Long id;
    private String email;
    private String source;
    private String status;
    private String ipAddress;
    private Instant createdAt;
    private Instant subscribedAt;
    private Instant unsubscribedAt;
}

