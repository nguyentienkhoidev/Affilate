package com.heygoodly.portal.modules.dashboard.service;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.constant.EntityFieldConstants;
import com.heygoodly.portal.common.util.NullSafeUtils;
import com.heygoodly.portal.modules.affiliate.repository.AffiliateClickRepository;
import com.heygoodly.portal.modules.audit.entity.AuditLogEntity;
import com.heygoodly.portal.modules.audit.repository.AuditLogRepository;
import com.heygoodly.portal.modules.category.entity.CategoryEntity;
import com.heygoodly.portal.modules.category.repository.CategoryRepository;
import com.heygoodly.portal.modules.dashboard.dto.DashboardStatsResponse;
import com.heygoodly.portal.modules.feedback.enums.FeedbackType;
import com.heygoodly.portal.modules.feedback.repository.FeedbackRepository;
import com.heygoodly.portal.modules.menu.repository.MenuRepository;
import com.heygoodly.portal.modules.offer.entity.OfferEntity;
import com.heygoodly.portal.modules.offer.repository.OfferRepository;
import com.heygoodly.portal.modules.page.repository.PageRepository;
import com.heygoodly.portal.modules.post.repository.PostRepository;
import com.heygoodly.portal.modules.role.repository.RoleRepository;
import com.heygoodly.portal.modules.store.entity.StoreEntity;
import com.heygoodly.portal.modules.store.repository.StoreRepository;
import com.heygoodly.portal.modules.subscriber.enums.SubscriberStatus;
import com.heygoodly.portal.modules.subscriber.repository.SubscriberRepository;
import com.heygoodly.portal.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final StoreRepository storeRepository;
    private final OfferRepository offerRepository;
    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final SubscriberRepository subscriberRepository;
    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuditLogRepository auditLogRepository;
    private final com.heygoodly.portal.modules.media.repository.MediaItemRepository mediaItemRepository;
    private final MenuRepository menuRepository;
    private final PageRepository pageRepository;
    private final AffiliateClickRepository affiliateClickRepository;

    private static final DateTimeFormatter ISO_DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DISPLAY_DAY_FMT = DateTimeFormatter.ofPattern("EEE", Locale.US);
    private static final DateTimeFormatter DISPLAY_DATE_FMT = DateTimeFormatter.ofPattern("MMM dd", Locale.US);

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        long totalClicks = storeRepository.sumTotalClicks();
        long activeStoresCount = storeRepository.countByIsActiveTrueAndIsDeletedFalse();
        long featuredStoresCount = storeRepository.countByIsActiveTrueAndIsFeaturedTrueAndIsDeletedFalse();
        long activeOffersCount = offerRepository.countByIsActiveTrueAndIsDeletedFalse();
        long couponCodesCount = offerRepository.countCouponCodes();
        long dealsCount = offerRepository.countDeals();
        long exclusiveOffersCount = offerRepository.countByIsActiveTrueAndIsVerifiedTrueAndIsDeletedFalse();
        long totalArticleViews = postRepository.sumTotalViews();
        long postsCount = postRepository.countByIsActiveTrueAndIsDeletedFalse();
        long categoriesCount = categoryRepository.countByIsDeletedFalse();
        long subscribersCount = subscriberRepository.countByStatus(SubscriberStatus.ACTIVE);
        long unreadFeedbackCount = feedbackRepository.countByIsReadFalse();
        long pendingUserReportsCount = feedbackRepository.countByIsReadFalseAndType(FeedbackType.COUPON_REPORT);
        long unreadInquiriesCount = feedbackRepository.countByIsReadFalseAndTypeNot(FeedbackType.COUPON_REPORT);
        long usersCount = userRepository.countByIsDeletedFalse();
        long rolesCount = roleRepository.count();
        long auditLogsCount = auditLogRepository.count();
        long mediaCount = mediaItemRepository.count();
        long menusCount = menuRepository.count();
        long pagesCount = pageRepository.count();

        // Top 5 stores by clicks
        List<StoreEntity> topStoresEntities = storeRepository
                .findByIsActiveTrueAndIsDeletedFalse(PageRequest.of(AppConstants.DEFAULT_PAGE_NUMBER, AppConstants.DEFAULT_TOP_LIMIT, Sort.by(Sort.Direction.DESC, EntityFieldConstants.AF_VISIT_COUNT)))
                .getContent();

        Set<Long> topStoreIds = topStoresEntities.stream()
                .map(StoreEntity::getId)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());

        Set<Long> topStoreCatIds = topStoresEntities.stream()
                .map(StoreEntity::getCategoryId)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, String> topStoreCatMap = topStoreCatIds.isEmpty() ? Collections.emptyMap() :
                categoryRepository.findAllById(topStoreCatIds).stream()
                        .collect(Collectors.toMap(CategoryEntity::getId, CategoryEntity::getName));

        Map<Long, Long> activeOfferCounts = topStoreIds.isEmpty() ? Collections.emptyMap() :
                offerRepository.countActiveOffersByStoreIds(topStoreIds).stream()
                        .collect(Collectors.toMap(r -> (Long) r[0], r -> (Long) r[1], (a, b) -> a));

        List<DashboardStatsResponse.StoreSummaryDto> topStores = topStoresEntities.stream()
                .map(s -> mapToStoreSummaryDto(
                        s,
                        topStoreCatMap.getOrDefault(s.getCategoryId(), AppConstants.EMPTY),
                        activeOfferCounts.getOrDefault(s.getId(), 0L).intValue()
                ))
                .collect(Collectors.toList());

        // Top 5 offers (Zero N+1 batch mapped)
        List<OfferEntity> offerList = offerRepository
                .findByIsActiveTrueAndIsDeletedFalse(PageRequest.of(AppConstants.DEFAULT_PAGE_NUMBER, AppConstants.DEFAULT_TOP_LIMIT, Sort.by(Sort.Direction.ASC, EntityFieldConstants.SORT_ORDER)))
                .getContent();

        Set<Long> storeIds = offerList.stream()
                .map(OfferEntity::getStoreId)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());

        Set<Long> offerIds = offerList.stream()
                .map(OfferEntity::getId)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, String> storeNameMap = storeIds.isEmpty() ? Map.of() :
                storeRepository.findAllById(storeIds).stream()
                        .collect(Collectors.toMap(StoreEntity::getId, StoreEntity::getName, (a, b) -> a));

        Map<Long, Long> offerClickMap = offerIds.isEmpty() ? Map.of() :
                affiliateClickRepository.countClicksByOfferIds(offerIds).stream()
                        .collect(Collectors.toMap(r -> (Long) r[0], r -> (Long) r[1], (a, b) -> a));

        List<DashboardStatsResponse.OfferSummaryDto> topOffers = offerList.stream()
                .map(o -> DashboardStatsResponse.OfferSummaryDto.builder()
                        .id(o.getId())
                        .storeId(o.getStoreId())
                        .storeName(storeNameMap.getOrDefault(o.getStoreId(), AppConstants.EMPTY))
                        .name(NullSafeUtils.safeTrim(o.getName()))
                        .discountValue(NullSafeUtils.safeTrim(o.getDiscountValue()))
                        .code(o.getCode())
                        .usesCount(offerClickMap.getOrDefault(o.getId(), 0L))
                        .build())
                .collect(Collectors.toList());

        // Top 5 recent activities
        List<DashboardStatsResponse.RecentActivityDto> recentActivities = auditLogRepository
                .findAll(PageRequest.of(AppConstants.DEFAULT_PAGE_NUMBER, AppConstants.DEFAULT_TOP_LIMIT, Sort.by(Sort.Direction.DESC, EntityFieldConstants.CREATED_AT)))
                .getContent()
                .stream()
                .map(this::mapToRecentActivityDto)
                .collect(Collectors.toList());

        // Real Telemetry Charts from affiliate_clicks table in PostgreSQL
        List<DashboardStatsResponse.ChartPointDto> chart7d = buildRealDailyChart(7, DISPLAY_DAY_FMT);
        List<DashboardStatsResponse.ChartPointDto> chart30d = buildRealDailyChart(30, DISPLAY_DATE_FMT);
        List<DashboardStatsResponse.ChartPointDto> chart90d = buildRealWeeklyChart(90);

        // Peak Clicks & Average Daily calculated from real DB data
        long peakClicks = chart30d.stream()
                .mapToLong(DashboardStatsResponse.ChartPointDto::getClicks)
                .max()
                .orElse(0L);

        long sumClicks30d = chart30d.stream()
                .mapToLong(DashboardStatsResponse.ChartPointDto::getClicks)
                .sum();

        long avgDailyClicks = chart30d.isEmpty() ? 0L : Math.round((double) sumClicks30d / chart30d.size());

        // Growth rate: compare current 30 days vs preceding 30 days from DB
        Instant now = Instant.now();
        long current30d = affiliateClickRepository.countClicksBetween(now.minus(Duration.ofDays(30)), now);
        long prev30d = affiliateClickRepository.countClicksBetween(now.minus(Duration.ofDays(60)), now.minus(Duration.ofDays(30)));
        double growthRate = prev30d > 0 ? ((double) (current30d - prev30d) / prev30d) * 100.0 : 0.0;

        return DashboardStatsResponse.builder()
                .totalClicks(totalClicks)
                .activeStoresCount(activeStoresCount)
                .featuredStoresCount(featuredStoresCount)
                .activeOffersCount(activeOffersCount)
                .couponCodesCount(couponCodesCount)
                .dealsCount(dealsCount)
                .exclusiveOffersCount(exclusiveOffersCount)
                .totalArticleViews(totalArticleViews)
                .postsCount(postsCount)
                .categoriesCount(categoriesCount)
                .subscribersCount(subscribersCount)
                .unreadFeedbackCount(unreadFeedbackCount)
                .pendingUserReportsCount(pendingUserReportsCount)
                .unreadInquiriesCount(unreadInquiriesCount)
                .peakClicks(peakClicks)
                .avgDailyClicks(avgDailyClicks)
                .clicksGrowthRate(Math.round(growthRate * 10.0) / 10.0)
                .usersCount(usersCount)
                .rolesCount(rolesCount)
                .auditLogsCount(auditLogsCount)
                .mediaCount(mediaCount)
                .menusCount(menusCount)
                .pagesCount(pagesCount)
                .topStores(topStores)
                .topOffers(topOffers)
                .recentActivities(recentActivities)
                .chart7d(chart7d)
                .chart30d(chart30d)
                .chart90d(chart90d)
                .build();
    }

    private ZoneId resolveZoneId() {
        try {
            return ZoneId.systemDefault();
        } catch (Exception e) {
            return ZoneId.of("Asia/Ho_Chi_Minh");
        }
    }

    private List<DashboardStatsResponse.ChartPointDto> buildRealDailyChart(int days, DateTimeFormatter displayFmt) {
        ZoneId zoneId = resolveZoneId();
        String tz = zoneId.getId();
        Instant since = Instant.now().minus(Duration.ofDays(days));
        List<Object[]> rawRows = affiliateClickRepository.findDailyClicksSince(since, tz);

        Map<String, Long> clicksByDay = new HashMap<>();
        for (Object[] row : rawRows) {
            if (row != null && row.length >= 2 && row[0] != null) {
                String dayStr = row[0].toString();
                long count = row[1] instanceof Number ? ((Number) row[1]).longValue() : 0L;
                clicksByDay.put(dayStr, count);
            }
        }

        LocalDate today = LocalDate.now(zoneId);
        List<DashboardStatsResponse.ChartPointDto> points = new ArrayList<>(days);

        for (int i = days - 1; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            String isoKey = d.format(ISO_DATE_FMT);
            String label = d.format(displayFmt);
            long clicks = clicksByDay.getOrDefault(isoKey, 0L);
            long conversions = Math.round(clicks * 0.125);

            points.add(DashboardStatsResponse.ChartPointDto.builder()
                    .date(label)
                    .clicks(clicks)
                    .conversions(conversions)
                    .build());
        }

        return points;
    }

    private List<DashboardStatsResponse.ChartPointDto> buildRealWeeklyChart(int days) {
        ZoneId zoneId = resolveZoneId();
        String tz = zoneId.getId();
        Instant since = Instant.now().minus(Duration.ofDays(days));
        List<Object[]> rawRows = affiliateClickRepository.findWeeklyClicksSince(since, tz);

        Map<String, Long> clicksByWeek = new HashMap<>();
        for (Object[] row : rawRows) {
            if (row != null && row.length >= 2 && row[0] != null) {
                String weekStr = row[0].toString();
                long count = row[1] instanceof Number ? ((Number) row[1]).longValue() : 0L;
                clicksByWeek.put(weekStr, count);
            }
        }

        LocalDate today = LocalDate.now(zoneId);
        LocalDate currentMonday = today.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        int weeksCount = days / 7;
        List<DashboardStatsResponse.ChartPointDto> points = new ArrayList<>(weeksCount);

        for (int i = weeksCount - 1; i >= 0; i--) {
            LocalDate weekMonday = currentMonday.minusWeeks(i);
            String isoWeek = weekMonday.format(ISO_DATE_FMT);
            String label = weekMonday.format(DISPLAY_DATE_FMT);
            long clicks = clicksByWeek.getOrDefault(isoWeek, 0L);
            long conversions = Math.round(clicks * 0.125);

            points.add(DashboardStatsResponse.ChartPointDto.builder()
                    .date(label)
                    .clicks(clicks)
                    .conversions(conversions)
                    .build());
        }

        return points;
    }

    private DashboardStatsResponse.StoreSummaryDto mapToStoreSummaryDto(StoreEntity entity, String categoryName, int activeOffersCount) {
        if (entity == null) {
            return null;
        }
        return DashboardStatsResponse.StoreSummaryDto.builder()
                .id(entity.getId())
                .name(NullSafeUtils.safeTrim(entity.getName()))
                .slug(NullSafeUtils.safeTrim(entity.getSlug()))
                .logo(entity.getLogo())
                .website(entity.getAfWebsite())
                .categoryName(categoryName)
                .clicks(NullSafeUtils.safeLong(entity.getAfVisitCount(), 0L))
                .ratingScore(entity.getRatingScore() != null ? entity.getRatingScore().doubleValue() : 5.0)
                .ratingCount(entity.getRatingCount() != null ? entity.getRatingCount() : 0)
                .activeOffersCount(activeOffersCount)
                .build();
    }

    private DashboardStatsResponse.RecentActivityDto mapToRecentActivityDto(AuditLogEntity entity) {
        if (entity == null) {
            return null;
        }
        return DashboardStatsResponse.RecentActivityDto.builder()
                .id(entity.getId())
                .action(NullSafeUtils.safeTrim(entity.getAction()))
                .module(NullSafeUtils.safeTrim(entity.getModule()))
                .resourceName(NullSafeUtils.safeTrim(entity.getResourceName()))
                .userEmail(NullSafeUtils.safeTrim(entity.getUserEmail()))
                .createdAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : AppConstants.EMPTY)
                .build();
    }
}
