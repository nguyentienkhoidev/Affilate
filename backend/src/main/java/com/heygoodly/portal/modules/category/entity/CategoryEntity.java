package com.heygoodly.portal.modules.category.entity;

import com.heygoodly.portal.common.entity.BaseEntity;
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

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "categories")
public class CategoryEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true, length = 200)
    private String slug;

    @Builder.Default
    @Column(nullable = false, length = 50)
    private String type = "post"; // 'post' or 'store'

    @Column(name = "parent_id")
    private Long parentId;

    @Column(length = 500)
    private String image;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Builder.Default
    @Column(name = "show_on_home", nullable = false)
    private Boolean showOnHome = false;

    @Builder.Default
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = com.heygoodly.portal.common.constant.AppConstants.DEFAULT_SORT_ORDER;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "meta_title")
    private String metaTitle;

    @Column(name = "meta_keywords")
    private String metaKeywords;

    @Column(name = "meta_description", columnDefinition = "text")
    private String metaDescription;
}
