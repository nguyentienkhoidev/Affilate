package com.heygoodly.portal.modules.store.entity;

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

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "store_reviews")
public class StoreReviewEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "store_id", nullable = false)
    private Long storeId;

    @Column(name = "reviewer_profile_id")
    private Long reviewerProfileId;

    @Column(name = "reviewer_name", nullable = false, length = 120)
    private String reviewerName;

    @Column(name = "reviewer_avatar", length = 500)
    private String reviewerAvatar;

    @Builder.Default
    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = true;

    @Builder.Default
    @Column(nullable = false)
    private Integer rating = 5;

    @Column(name = "review_date_label", length = 80)
    private String reviewDateLabel;

    @Column(nullable = false, columnDefinition = "text")
    private String comment;

    @Builder.Default
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
