'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/constants/routes';
import { 
  Store, 
  Tag, 
  FileText, 
  MousePointerClick, 
  Plus, 
  TrendingUp,
  AlertTriangle,
  Flame,
  Zap,
  ArrowUpRight,
  Activity,
  Layers,
} from 'lucide-react';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAdminCounts } from '@/lib/admin/useAdminCounts';
import { useAdminI18n } from '@/context/AdminI18nContext';
import { useTheme } from '@/context/ThemeContext';
import { dashboardService, type DashboardStats } from '@/services/dashboardService';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [liveStats, setLiveStats] = useState<DashboardStats | null>(() => dashboardService.getCachedStats());
  const { t } = useAdminI18n();
  const { isDark } = useTheme();
  const counts = useAdminCounts();
  
  useEffect(() => {
    const unsubscribe = dashboardService.subscribe((data) => {
      setLiveStats(data);
    });

    dashboardService.getStats(true).then((data) => {
      if (data) {
        setLiveStats(data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 1. Calculations for Core KPIs (100% Database-Driven via Spring Boot REST API)
  const totalStoreClicks = liveStats?.totalClicks ?? 0;
  const totalArticleViews = liveStats?.totalArticleViews ?? 0;
  const activeStoresCount = liveStats?.activeStoresCount ?? 0;
  const featuredStoresCount = liveStats?.featuredStoresCount ?? 0;
  const activeOffersCount = liveStats?.activeOffersCount ?? 0;
  const couponCodesCount = liveStats?.couponCodesCount ?? 0;
  const dealsCount = liveStats?.dealsCount ?? 0;
  const exclusiveOffersCount = liveStats?.exclusiveOffersCount ?? 0;
  const pendingUserReports = liveStats?.pendingUserReportsCount ?? 0;
  const unreadInquiries = liveStats?.unreadInquiriesCount ?? liveStats?.unreadFeedbackCount ?? 0;
  const subscribersCount = liveStats?.subscribersCount ?? counts.subscribersCount ?? 0;
  const postsCount = liveStats?.postsCount ?? counts.postsCount ?? 0;
  const categoriesCount = liveStats?.categoriesCount ?? counts.categoriesCount ?? 0;

  // 2. Top Performing Stores (sorted by clicks from backend DB)
  const topStores = useMemo(() => {
    if (liveStats?.topStores && liveStats.topStores.length > 0) {
      return liveStats.topStores.map((s) => {
        let domain = `${s.slug}.com`;
        if (s.website) {
          try {
            domain = new URL(s.website).hostname.replace(/^www\./, '');
          } catch {
            domain = `${s.slug}.com`;
          }
        }
        return {
          id: String(s.id),
          name: s.name,
          slug: s.slug,
          domain,
          logoUrl: s.logo,
          clicks: s.clicks,
          rating: s.ratingScore,
        };
      });
    }
    return [];
  }, [liveStats]);

  // 3. Top Converting Offers (sorted by usesCount from backend DB)
  const topOffers = useMemo(() => {
    if (liveStats?.topOffers && liveStats.topOffers.length > 0) {
      return liveStats.topOffers.map((o) => ({
        id: String(o.id),
        title: o.name,
        storeName: o.storeName || 'Store Partner',
        couponCode: o.code,
        discount: o.discountValue,
        isExclusive: false,
        usesCount: o.usesCount,
      }));
    }
    return [];
  }, [liveStats]);

  // 4. Recent audit actions from backend DB
  const recentActivities = useMemo(() => {
    if (liveStats?.recentActivities && liveStats.recentActivities.length > 0) {
      return liveStats.recentActivities.map((log) => ({
        id: String(log.id),
        action: log.action,
        target: log.resourceName || log.module,
        author: log.userEmail,
        time: log.createdAt ? new Date(log.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'UTC',
        }) : 'Recent',
      }));
    }
    return [];
  }, [liveStats]);

  // 5. Real Telemetry Time Series
  const chartData = useMemo(() => {
    if (timeRange === '7d' && liveStats?.chart7d && liveStats.chart7d.length > 0) {
      return liveStats.chart7d;
    }
    if (timeRange === '30d' && liveStats?.chart30d && liveStats.chart30d.length > 0) {
      return liveStats.chart30d;
    }
    if (timeRange === '90d' && liveStats?.chart90d && liveStats.chart90d.length > 0) {
      return liveStats.chart90d;
    }
    return [];
  }, [timeRange, liveStats]);

  const peakClicks = useMemo(() => {
    if (!chartData || chartData.length === 0) return liveStats?.peakClicks ?? 0;
    return Math.max(...chartData.map((d) => d.clicks || 0));
  }, [chartData, liveStats]);

  const averageDaily = useMemo(() => {
    if (!chartData || chartData.length === 0) return liveStats?.avgDailyClicks ?? 0;
    const sum = chartData.reduce((acc, d) => acc + (d.clicks || 0), 0);
    return Math.round(sum / chartData.length);
  }, [chartData, liveStats]);

  const projectedGrowth = useMemo(() => {
    if (!chartData || chartData.length < 2) {
      return liveStats?.clicksGrowthRate != null
        ? `${liveStats.clicksGrowthRate >= 0 ? '+' : ''}${liveStats.clicksGrowthRate.toFixed(1)}%`
        : '0.0%';
    }
    const first = chartData[0].clicks || 1;
    const last = chartData[chartData.length - 1].clicks || 0;
    const growth = ((last - first) / first) * 100;
    return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
  }, [chartData, liveStats]);

  // 6. Primary KPI Cards Data (Zero Mock / 100% DB-driven)
  const stats = [
    {
      title: t('Recorded Store Clicks'),
      value: liveStats ? totalStoreClicks.toLocaleString() : '...',
      percentage: liveStats?.clicksGrowthRate != null
        ? `${liveStats.clicksGrowthRate >= 0 ? '+' : ''}${liveStats.clicksGrowthRate.toFixed(1)}% vs last period`
        : t('All-time clicks'),
      icon: MousePointerClick,
      metric: liveStats?.avgDailyClicks
        ? t(`~${liveStats.avgDailyClicks.toLocaleString()} avg / day`)
        : t('Real-time tracking'),
      trendUp: (liveStats?.clicksGrowthRate ?? 0) >= 0,
      accent: 'border-l-4 border-l-indigo-600',
    },
    {
      title: t('Active Stores Directory'),
      value: liveStats ? activeStoresCount.toLocaleString() : '...',
      percentage: t(`${activeStoresCount} active`),
      icon: Store,
      metric: t(`${featuredStoresCount} featured brands`),
      trendUp: true,
      accent: 'border-l-4 border-l-blue-500',
    },
    {
      title: t('Active Coupons & Deals'),
      value: liveStats ? activeOffersCount.toLocaleString() : '...',
      percentage: t(`${couponCodesCount} codes • ${dealsCount} deals`),
      icon: Tag,
      metric: t(`${exclusiveOffersCount} verified offers`),
      trendUp: true,
      accent: 'border-l-4 border-l-emerald-500',
    },
    {
      title: t('Published Articles'),
      value: liveStats ? postsCount.toLocaleString() : '...',
      percentage: t(`${totalArticleViews.toLocaleString()} views`),
      icon: FileText,
      metric: t(`${categoriesCount} categories`),
      trendUp: true,
      accent: 'border-l-4 border-l-amber-500',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header Area & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
              {t('Executive Operations Dashboard')}
            </h1>
            <Badge variant="indigo" className="text-[11px] font-semibold py-0.5">
              Live Real-Time
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {t('Real-time affiliate performance, conversion telemetry, and operational health.')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link href={ROUTES.ADMIN.STORE_CREATE}>
            <Button variant="outline" size="sm" className="shadow-2xs">
              <Plus size={14} className="mr-1" /> {t('Add Merchant')}
            </Button>
          </Link>
          <Link href={ROUTES.ADMIN.OFFER_CREATE}>
            <Button variant="outline" size="sm" className="shadow-2xs">
              <Plus size={14} className="mr-1" /> {t('New Coupon')}
            </Button>
          </Link>
          <Link href={ROUTES.ADMIN.POST_CREATE}>
            <Button size="sm" className="shadow-2xs bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus size={14} className="mr-1" /> {t('Write Review')}
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Critical Operational Alerts Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href={ROUTES.ADMIN.FEEDBACK} className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-between hover:border-rose-300 transition">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <AlertTriangle size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900">{pendingUserReports} {t('User Reports Pending')}</p>
              <p className="text-[11px] text-zinc-500">Feedback & coupon invalid alert</p>
            </div>
          </div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
            pendingUserReports > 0 ? 'text-rose-700 bg-rose-100' : 'text-emerald-700 bg-emerald-100'
          }`}>
            {pendingUserReports > 0 ? 'Urgent' : 'Clear'}
          </span>
        </Link>

        <Link href={ROUTES.ADMIN.FEEDBACK} className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-between hover:border-indigo-300 transition">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <Zap size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900">{unreadInquiries} {t('Unread Inquiries')}</p>
              <p className="text-[11px] text-zinc-500">{subscribersCount} Newsletter subscribers</p>
            </div>
          </div>
          <ArrowUpRight size={14} className="text-indigo-600" />
        </Link>
      </div>

      {/* 3. Primary KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className={`p-5 space-y-3 ${stat.accent}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">{stat.title}</span>
                <div className="p-2 rounded-lg bg-zinc-100 text-zinc-700">
                  <Icon size={16} />
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold tracking-tight text-zinc-900">
                  {stat.value}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs">
                  <span className={`inline-flex items-center font-semibold ${stat.trendUp ? 'text-emerald-600' : 'text-zinc-500'}`}>
                    <TrendingUp size={13} className="mr-0.5" /> {stat.percentage}
                  </span>
                  <span className="text-zinc-400">•</span>
                  <span className="text-zinc-500">{stat.metric}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 4. Visual Analytics: Traffic Chart */}
      <Card className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>{t('Affiliate Outbound Referrals & Growth')}</CardTitle>
              <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Activity size={12} className="mr-1" />
                {liveStats?.clicksGrowthRate != null
                  ? `${liveStats.clicksGrowthRate >= 0 ? '+' : ''}${liveStats.clicksGrowthRate.toFixed(1)}% MoM`
                  : 'Live Telemetry'}
              </span>
            </div>
            <CardDescription>{t('Daily referral clicks and conversion trends across all stores')}</CardDescription>
          </div>

          <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80 text-xs">
            {(['7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  timeRange === r
                    ? 'bg-white text-zinc-900 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="h-72 w-full flex flex-col items-center justify-center text-zinc-400 text-xs border border-dashed border-zinc-200 rounded-lg">
            <Activity size={24} className="mb-2 text-zinc-300" />
            <p>{t('No telemetry data recorded for this time range.')}</p>
          </div>
        ) : (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="convGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#232b3e' : '#e4e4e7'}
                  vertical={false}
                  opacity={isDark ? 0.85 : 0.6}
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#71717a' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#71717a' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#121722' : '#18181b',
                    borderColor: isDark ? '#232b3e' : '#27272a',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.45)',
                  }}
                  itemStyle={{ color: '#a5b4fc' }}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  name="Referral Clicks"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#clickGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="conversions"
                  name="Estimated Conversions"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#convGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-100 text-center text-xs">
          <div>
            <p className="text-zinc-500">{t('Peak Clicks')}</p>
            <p className="font-bold text-zinc-900 text-sm mt-0.5">{peakClicks.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-zinc-500">{t('Average Daily')}</p>
            <p className="font-bold text-zinc-900 text-sm mt-0.5">{averageDaily.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-zinc-500">{t('Projected Growth')}</p>
            <p className="font-bold text-emerald-600 text-sm mt-0.5">{projectedGrowth}</p>
          </div>
        </div>
      </Card>

      {/* 5. High-Impact Operational Highlights: Top Stores & Top Converting Offers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top 5 Performing Stores */}
        <Card className="lg:col-span-6 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-amber-500" />
                <CardTitle>{t('Top Performing Merchants')}</CardTitle>
              </div>
              <CardDescription>{t('Highest referral volume and merchant performance')}</CardDescription>
            </div>
            <Link href={ROUTES.ADMIN.STORES} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              {t('View All Stores →')}
            </Link>
          </div>

          <div className="divide-y divide-zinc-100">
            {topStores.map((st, idx) => (
              <div key={st.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-zinc-400 font-bold w-4 text-center">{idx + 1}</span>
                  <div className="w-9 h-9 rounded-lg bg-zinc-100 p-1 flex items-center justify-center shrink-0 border border-zinc-200/60 overflow-hidden">
                    {st.logoUrl ? (
                      <Image src={st.logoUrl} alt={st.name} width={36} height={36} className="object-contain" />
                    ) : (
                      <Store size={16} className="text-zinc-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-zinc-900 truncate">{st.name}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{st.domain}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-mono font-bold text-zinc-900 text-sm">{(Number(st.clicks) || 0).toLocaleString()} <span className="text-[11px] font-normal text-zinc-400">clicks</span></p>
                  <p className="text-[11px] text-emerald-600 font-medium">Rating: {st.rating != null ? st.rating.toFixed(1) : '5.0'}/5</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Converting Coupons & Deals */}
        <Card className="lg:col-span-6 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Tag size={18} className="text-emerald-500" />
                <CardTitle>{t('Top Converting Offers')}</CardTitle>
              </div>
              <CardDescription>{t('Most redeemed discount promo codes and exclusive deals')}</CardDescription>
            </div>
            <Link href={ROUTES.ADMIN.OFFERS} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              {t('View All Offers →')}
            </Link>
          </div>

          <div className="divide-y divide-zinc-100">
            {topOffers.map((off, idx) => (
              <div key={off.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-zinc-400 font-bold w-4 text-center">{idx + 1}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 truncate">{off.storeName}</span>
                      {off.couponCode ? (
                        <span className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {off.couponCode}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                          Direct Deal
                        </span>
                      )}
                      {off.isExclusive && (
                        <Badge variant="indigo" className="text-[9px] py-0 px-1">Exclusive</Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">{off.title}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-bold text-emerald-600 text-sm">{off.discount}</p>
                  <p className="text-[11px] text-zinc-400 font-mono">{(Number(off.usesCount) || 0).toLocaleString()} uses</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* 6. Operational Audit Trail */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={17} className="text-indigo-500" />
            <CardTitle>{t('Recent Administrative Actions')}</CardTitle>
          </div>
          <Link href={ROUTES.ADMIN.TRACING} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
            {t('View Activity Audit →')}
          </Link>
        </div>

        <div className="divide-y divide-zinc-100">
          {recentActivities.map((act) => (
            <div key={act.id} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <div className="truncate">
                  <span className="font-semibold text-zinc-900">{act.action}: </span>
                  <span className="text-zinc-600 font-medium">{act.target}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-zinc-400 shrink-0">
                <span className="font-medium text-zinc-600">{act.author}</span>
                <span>•</span>
                <span suppressHydrationWarning>{act.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
