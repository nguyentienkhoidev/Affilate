package com.heygoodly.portal.modules.offer.entity;

import com.heygoodly.portal.common.entity.BaseEntity;
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
@Table(name = "offers")
public class OfferEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "store_id", nullable = false)
    private Long storeId;

    @Column(nullable = false)
    private String name;

    @Column(name = "discount_value", nullable = false, length = 100)
    private String discountValue;

    @Column(length = 100)
    private String code;

    @Column(name = "url_ref", nullable = false, columnDefinition = "text")
    private String urlRef;

    @Column(columnDefinition = "text")
    private String description;

    @Builder.Default
    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Builder.Default
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = com.heygoodly.portal.common.constant.AppConstants.DEFAULT_SORT_ORDER;

    @Column(name = "expire_at")
    private Instant expireAt;

    @Column(name = "image", length = 500)
    private String image;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "tags", columnDefinition = "jsonb")
    private String tags;
}
