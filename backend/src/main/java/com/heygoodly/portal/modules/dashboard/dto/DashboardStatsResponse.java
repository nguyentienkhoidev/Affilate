package com.heygoodly.portal.modules.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    private Long totalClicks;
    private Long activeStoresCount;
    private Long featuredStoresCount;
    private Long activeOffersCount;
    private Long couponCodesCount;
    private Long dealsCount;
    private Long exclusiveOffersCount;
    private Long totalArticleViews;
    private Long postsCount;
    private Long categoriesCount;
    private Long subscribersCount;
    private Long unreadFeedbackCount;
    private Long pendingUserReportsCount;
    private Long unreadInquiriesCount;
    private Long peakClicks;
    private Long avgDailyClicks;
    private Double clicksGrowthRate;
    private Long usersCount;
    private Long rolesCount;
    private Long auditLogsCount;
    private Long mediaCount;
    private Long menusCount;
    private Long pagesCount;

    private List<StoreSummaryDto> topStores;
    private List<OfferSummaryDto> topOffers;
    private List<RecentActivityDto> recentActivities;

    private List<ChartPointDto> chart7d;
    private List<ChartPointDto> chart30d;
    private List<ChartPointDto> chart90d;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChartPointDto {
        private String date;
        private Long clicks;
        private Long conversions;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StoreSummaryDto {
        private Long id;
        private String name;
        private String slug;
        private String logo;
        private String website;
        private String categoryName;
        private Long clicks;
        private Double ratingScore;
        private Integer ratingCount;
        private Integer activeOffersCount;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OfferSummaryDto {
        private Long id;
        private Long storeId;
        private String storeName;
        private String name;
        private String discountValue;
        private String code;
        private Long usesCount;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivityDto {
        private Long id;
        private String action;
        private String module;
        private String resourceName;
        private String userEmail;
        private String createdAt;
    }
}

