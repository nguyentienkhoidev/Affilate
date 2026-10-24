'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { 
  Store, 
  Tag, 
  FileText, 
  MousePointerClick, 
  Plus, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight,
  CheckCircle2, 
  Clock,
  TrendingUp,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const stats = [
    {
      title: 'Active Stores Directory',
      value: '3,742',
      change: '+14 this week',
      trend: 'up',
      percentage: '+3.8%',
      icon: Store,
      metric: '98% verified',
    },
    {
      title: 'Active Coupons & Deals',
      value: '14,890',
      change: '+120 today',
      trend: 'up',
      percentage: '+8.4%',
      icon: Tag,
      metric: '96.2% success rate',
    },
    {
      title: 'Outbound Referral Clicks',
      value: '248,500',
      change: '+32.4% vs last period',
      trend: 'up',
      percentage: '+32.4%',
      icon: MousePointerClick,
      metric: 'Avg 8.2K / day',
    },
    {
      title: 'Published Articles',
      value: '1,284',
      change: '+9 this week',
      trend: 'up',
      percentage: '+5.1%',
      icon: FileText,
      metric: '42 drafts pending',
    },
  ];

  // 30-Day Referral Click Data
  const chartData = [
    { date: 'Oct 01', clicks: 4200 },
    { date: 'Oct 04', clicks: 5100 },
    { date: 'Oct 07', clicks: 6800 },
    { date: 'Oct 10', clicks: 7400 },
    { date: 'Oct 13', clicks: 8200 },
    { date: 'Oct 16', clicks: 9600 },
    { date: 'Oct 19', clicks: 11200 },
    { date: 'Oct 20', clicks: 12400 },
  ];

  // Network Distribution Data
  const networkData = [
    { name: 'PartnerBoost', clicks: 92400, share: '37%' },
    { name: 'Impact', clicks: 74200, share: '30%' },
    { name: 'ShareASale', clicks: 51200, share: '21%' },
    { name: 'CJ Affiliate', clicks: 30700, share: '12%' },
  ];

  const recentActivities = [
    { id: 1, action: 'Verified coupon code added', target: 'Nilight (NILIGHT15)', author: 'Marcus Vance', time: '14 mins ago', status: 'success' },
    { id: 2, action: 'New store partner registered', target: 'Auxito LED', author: 'Elena Croft', time: '1 hour ago', status: 'info' },
    { id: 3, action: 'Review published', target: 'Neo Sabers Xenopixel In-Depth Test', author: 'Marcus Vance', time: '3 hours ago', status: 'success' },
    { id: 4, action: 'Staff account 2FA enforced', target: 'sarah@bargorya.com', author: 'System Security', time: '5 hours ago', status: 'warning' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
            Operational Overview
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Enterprise analytics, coupon verification health, and affiliate network telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href={ROUTES.ADMIN.STORE_CREATE}>
            <Button variant="outline" size="sm">
              <Plus size={14} /> Add Merchant
            </Button>
          </Link>
          <Link href={ROUTES.ADMIN.OFFER_CREATE}>
            <Button size="sm">
              <Plus size={14} /> New Coupon
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="p-5 space-y-3">
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
                  <span className="inline-flex items-center text-emerald-600 font-semibold">
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

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Outbound Traffic Chart */}
        <Card className="lg:col-span-8 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Affiliate Outbound Referrals & Growth</CardTitle>
              <CardDescription>Daily referral clicks and conversion trends across all stores</CardDescription>
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

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#09090b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  name="Referral Clicks"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#clickGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Network Breakdown Card */}
        <Card className="lg:col-span-4 p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-1">
            <CardTitle>Network Distribution</CardTitle>
            <CardDescription>Share of traffic by affiliate partner network</CardDescription>
          </div>

          <div className="space-y-4 my-auto">
            {networkData.map((item, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-800">{item.name}</span>
                  <span className="font-mono text-zinc-500">{item.clicks.toLocaleString()} clicks ({item.share})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: item.share }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-100 text-xs text-zinc-500 flex items-center justify-between">
            <span>Direct Redirect: HTTP 307</span>
            <Badge variant="success">Anti-Bot Active</Badge>
          </div>
        </Card>

      </div>

      {/* Operational Status & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Operational Log */}
        <Card className="lg:col-span-8 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle>Recent Administrative Actions</CardTitle>
            <Link href={ROUTES.ADMIN.POSTS} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              View Activity Audit &rarr;
            </Link>
          </div>

          <div className="divide-y divide-zinc-100">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div>
                    <span className="font-semibold text-zinc-900">{act.action}: </span>
                    <span className="text-zinc-600 font-medium">{act.target}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-zinc-400 shrink-0">
                  <span>{act.author}</span>
                  <span>•</span>
                  <span>{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Security & Infrastructure Health */}
        <Card className="lg:col-span-4 p-6 space-y-4">
          <CardTitle>Infrastructure Telemetry</CardTitle>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
              <div>
                <p className="font-semibold text-zinc-800">Database Engine</p>
                <p className="text-zinc-500 text-[11px]">PostgreSQL 16 • Liquibase Managed</p>
              </div>
              <Badge variant="success">Operational</Badge>
            </div>

            <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
              <div>
                <p className="font-semibold text-zinc-800">Authentication</p>
                <p className="text-zinc-500 text-[11px]">RFC 6238 TOTP 2FA + JWT</p>
              </div>
              <Badge variant="success">Secured</Badge>
            </div>

            <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
              <div>
                <p className="font-semibold text-zinc-800">SEO IndexNow</p>
                <p className="text-zinc-500 text-[11px]">Auto Ping Bing / Yandex / Google</p>
              </div>
              <Badge variant="indigo">Standby</Badge>
            </div>
          </div>
        </Card>

      </div>

    </div>
  );
}
