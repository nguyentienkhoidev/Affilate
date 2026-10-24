package com.bargorya.portal.modules.store.entity;

import com.bargorya.portal.common.entity.BaseEntity;
import com.bargorya.portal.modules.category.entity.CategoryEntity;
import com.bargorya.portal.modules.user.entity.UserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "stores")
public class StoreEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private CategoryEntity category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_user_id")
    private UserEntity assignedUser;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true, length = 200)
    private String slug;

    @Column(length = 500)
    private String logo;

    @Column(name = "social_card_image", length = 500)
    private String socialCardImage;

    @Column(name = "social_title")
    private String socialTitle;

    @Column(name = "social_description", length = 500)
    private String socialDescription;

    @Column(name = "about_store", columnDefinition = "text")
    private String aboutStore;

    @Builder.Default
    @Column(name = "max_offer", nullable = false)
    private Integer maxOffer = 50;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Builder.Default
    @Column(name = "is_searchable", nullable = false)
    private Boolean isSearchable = true;

    @Builder.Default
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 9999;

    @Builder.Default
    @Column(name = "rating_score", nullable = false, precision = 3, scale = 2)
    private BigDecimal ratingScore = BigDecimal.valueOf(5.00);

    @Builder.Default
    @Column(name = "rating_count", nullable = false)
    private Integer ratingCount = 0;

    @Column(name = "af_website", length = 500)
    private String afWebsite;

    @Builder.Default
    @Column(name = "af_status", length = 50)
    private String afStatus = "unregistered";

    @Column(name = "af_network", length = 100)
    private String afNetwork;

    @Builder.Default
    @Column(name = "af_visit_count", nullable = false)
    private Long afVisitCount = 0L;

    @Column(name = "af_portal_url", length = 500)
    private String afPortalUrl;

    @Column(name = "af_account", length = 150)
    private String afAccount;

    @Column(name = "af_commission", length = 100)
    private String afCommission;

    @Column(name = "internal_note", columnDefinition = "text")
    private String internalNote;

    @Builder.Default
    @Column(name = "ads_status", length = 50)
    private String adsStatus = "none";

    @Column(name = "ads_account", length = 100)
    private String adsAccount;

    @Column(name = "meta_title")
    private String metaTitle;

    @Column(name = "meta_keywords")
    private String metaKeywords;

    @Column(name = "meta_description", columnDefinition = "text")
    private String metaDescription;
}
