package com.heygoodly.portal.common.i18n.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
@Table(name = "i18n_messages")
public class I18nMessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "message_key", nullable = false, unique = true, length = 150)
    private String messageKey;

    @Column(name = "message_en", nullable = false, columnDefinition = "text")
    private String messageEn;

    @Column(name = "message_vi", nullable = false, columnDefinition = "text")
    private String messageVi;

    @Builder.Default
    @Column(nullable = false, length = 50)
    private String category = "ERROR";

    @Builder.Default
    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
}

