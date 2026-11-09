package com.heygoodly.portal.modules.subscriber.entity;

import com.heygoodly.portal.modules.subscriber.enums.SubscriberStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
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
@Entity
@Table(name = "subscribers")
public class SubscriberEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SubscriberStatus status = SubscriberStatus.ACTIVE;

    @Builder.Default
    @Column(length = 100)
    private String source = "homepage_footer";

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "subscribed_at", nullable = false)
    private Instant subscribedAt;

    @Column(name = "unsubscribed_at")
    private Instant unsubscribedAt;

    @PrePersist
    protected void onCreate() {
        if (this.subscribedAt == null) {
            this.subscribedAt = Instant.now();
        }
        if (this.status == null) {
            this.status = SubscriberStatus.ACTIVE;
        }
    }
}

