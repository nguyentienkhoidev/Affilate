'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Sparkles,
  Globe,
  CalendarDays,
  Save,
  RotateCcw,
  Plus,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useAdminI18n } from '@/context/AdminI18nContext';
import { settingService } from '@/services/settingService';
import { invalidateSiteSettingsCache } from '@/lib/admin/useSiteSettings';
import {
  ALL_MARKETS,
  TARGET_MARKETS,
  EXTRA_MARKETS,
  HOLIDAY_THEMES,
  DEFAULT_HOLIDAY_RULES,
  parseHolidayRules,
  parseCountryOverrides,
  resolveHolidayForCountry,
  type HolidayRule,
  type HolidayThemeId,
  type HolidayThemeMode,
  type HolidayRuleScope,
  type MarketCode,
  type CountryOverrideMap,
} from '@/lib/holidayTheme';

type ScopeFilter = 'all' | 'world' | 'six_markets' | MarketCode;

function formatRuleSchedule(rule: HolidayRule): string {
  if (rule.matcherType === 'fixed') {
    const sm = String(rule.startMonth || 1).padStart(2, '0');
    const sd = String(rule.startDay || 1).padStart(2, '0');
    const em = String(rule.endMonth || rule.startMonth || 1).padStart(2, '0');
    const ed = String(rule.endDay || rule.startDay || 1).padStart(2, '0');
    return `${sm}/${sd} – ${em}/${ed}`;
  }
  if (rule.matcherType === 'black_friday') {
    return 'Cyber Week (4th Thu Nov ±4d)';
  }
  if (rule.matcherType === 'easter') {
    return 'Easter Weekend (-3d/+1d)';
  }
  const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const nthLabel = rule.nth === -1 ? 'Last' : `${rule.nth || 1}x`;
  return `${nthLabel} ${weekdays[rule.weekday ?? 1]} ${months[rule.month || 1]}`;
}

export default function AdminHolidaysPage() {
  const { toast } = useToast();
  const { t } = useAdminI18n();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [mode, setMode] = useState<HolidayThemeMode>('off');
  const [manualTheme, setManualTheme] = useState<HolidayThemeId>('none');
  const [effectsEnabled, setEffectsEnabled] = useState<boolean>(true);
  const [countryOverrides, setCountryOverrides] = useState<CountryOverrideMap>({});
  const [rules, setRules] = useState<HolidayRule[]>(DEFAULT_HOLIDAY_RULES);

  // Simulator & filter state
  const [simCountry, setSimCountry] = useState<MarketCode>('US');
  const [simDate, setSimDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');

  // Add custom rule modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleScope, setNewRuleScope] = useState<HolidayRuleScope>('country');
  const [newRuleTheme, setNewRuleTheme] = useState<HolidayThemeId>('prime_day');
  const [newRulePriority, setNewRulePriority] = useState<number>(80);
  const [newRuleCountries, setNewRuleCountries] = useState<MarketCode[]>(['US']);
  const [newRuleExclude, setNewRuleExclude] = useState<MarketCode[]>([]);
  const [newStartMonth, setNewStartMonth] = useState<number>(11);
  const [newStartDay, setNewStartDay] = useState<number>(15);
  const [newEndMonth, setNewEndMonth] = useState<number>(11);
  const [newEndDay, setNewEndDay] = useState<number>(20);
  const [newRibbonText, setNewRibbonText] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const db = await settingService.getAdminSettings();
        if (!mounted) return;
        const rawMode = db.holiday_theme_mode;
        setMode(rawMode === 'auto' || rawMode === 'manual' ? rawMode : 'off');
        setManualTheme((db.holiday_theme_manual as HolidayThemeId) || 'none');
        setEffectsEnabled(db.holiday_effects_enabled !== 'false');
        setCountryOverrides(parseCountryOverrides(db.holiday_country_overrides));
        setRules(parseHolidayRules(db.holiday_custom_rules));
      } catch {
        toast.error('Failed to load holiday settings from database.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, [toast]);

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await settingService.updateAdminSettings({
        holiday_theme_mode: mode,
        holiday_theme_manual: manualTheme,
        holiday_effects_enabled: String(Boolean(effectsEnabled)),
        holiday_country_overrides: JSON.stringify(countryOverrides),
        holiday_custom_rules: JSON.stringify(rules),
      });
      invalidateSiteSettingsCache();
      toast.success(t('Holiday & Geo theme configuration saved to PostgreSQL.'));
    } catch {
      toast.error('Failed to save holiday configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetCalendar = () => {
    setRules(DEFAULT_HOLIDAY_RULES);
    setCountryOverrides({});
    toast.success(t('Restored default 6-market & global priority calendar (click Save to persist).'));
  };

  const toggleRuleEnabled = (id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const updateRulePriority = (id: string, priority: number) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, priority } : r)));
  };

  const deleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddCustomRule = () => {
    if (!newRuleName.trim()) {
      toast.error('Please enter a rule name.');
      return;
    }
    if (newRuleCountries.length === 0) {
      toast.error('Select at least one target market.');
      return;
    }
    const created: HolidayRule = {
      id: `custom-${Date.now()}`,
      name: newRuleName.trim(),
      scope: newRuleScope,
      themeId: newRuleTheme,
      priority: Number(newRulePriority) || 80,
      countries: newRuleCountries,
      excludeCountries: newRuleExclude.length > 0 ? newRuleExclude : undefined,
      matcherType: 'fixed',
      startMonth: newStartMonth,
      startDay: newStartDay,
      endMonth: newEndMonth,
      endDay: newEndDay,
      customRibbonText: newRibbonText.trim() || undefined,
      enabled: true,
    };
    setRules((prev) => [created, ...prev]);
    setShowAddModal(false);
    setNewRuleName('');
    setNewRibbonText('');
    toast.success('Added custom rule (click Save Changes to persist).');
  };

  const simDateObj = useMemo(() => {
    if (!simDate) return new Date();
    return new Date(`${simDate}T12:00:00Z`);
  }, [simDate]);

  const simResult = useMemo(() => {
    return resolveHolidayForCountry({
      mode,
      manualTheme,
      countryOverridesJson: JSON.stringify(countryOverrides),
      customRulesJson: JSON.stringify(rules),
      countryCode: simCountry,
      now: simDateObj,
    });
  }, [mode, manualTheme, countryOverrides, rules, simCountry, simDateObj]);

  const filteredRules = useMemo(() => {
    const sorted = [...rules].sort((a, b) => b.priority - a.priority);
    if (scopeFilter === 'all') return sorted;
    if (scopeFilter === 'world' || scopeFilter === 'six_markets') {
      return sorted.filter((r) => r.scope === scopeFilter);
    }
    return sorted.filter(
      (r) =>
        (r.countries.includes(scopeFilter) || (r.countries.includes('GLOBAL') && r.scope === 'world')) &&
        !r.excludeCountries?.includes(scopeFilter)
    );
  }, [rules, scopeFilter]);

  const toggleMarketSelection = (list: MarketCode[], code: MarketCode, setter: (v: MarketCode[]) => void) => {
    if (list.includes(code)) {
      setter(list.filter((c) => c !== code));
    } else {
      setter([...list, code]);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="h-10 w-64 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-4" />
        <div className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-600 shrink-0" />
            {t('Holiday & Geo Themes')}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {t('Configure global, 6-market shared, and country-specific sale themes with automatic Geo-IP detection and non-overlapping priority rules.')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetCalendar}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 px-4 py-2.5 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-xs transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>{t('Reset Defaults')}</span>
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSaveAll}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 px-5 py-2.5 text-xs font-semibold rounded-xl bg-zinc-900 dark:bg-rose-600 text-white hover:bg-zinc-800 dark:hover:bg-rose-500 shadow-sm shadow-rose-600/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 shrink-0" />
            <span>{saving ? t('Saving...') : t('Save Changes')}</span>
          </button>
        </div>
      </div>

      {/* 1. Master Mode & Visual Effects */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-rose-500" />
            {t('1. Master Activation Mode')}
          </h2>
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={effectsEnabled}
              onChange={(e) => setEffectsEnabled(e.target.checked)}
              className="rounded border-zinc-300 text-rose-600 focus:ring-rose-500"
            />
            {t('Enable festive falling effects (snow, confetti, shimmer)')}
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(
            [
              {
                id: 'off',
                title: t('Off (Normal Layout)'),
                desc: t('Standard year-round appearance across all countries.'),
              },
              {
                id: 'auto',
                title: t('Auto (Geo-IP + Priority Calendar)'),
                desc: t('Detects visitor country via IP & timezone, resolving global vs regional holidays without overlap.'),
              },
              {
                id: 'manual',
                title: t('Manual Global Override'),
                desc: t('Force one specific holiday theme across every market worldwide.'),
              },
            ] as const
          ).map((item) => {
            const active = mode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={`text-left p-3.5 rounded-lg border transition-all ${
                  active
                    ? 'border-rose-600 bg-rose-50/70 dark:bg-rose-950/30 ring-1 ring-rose-600'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">{item.desc}</div>
              </button>
            );
          })}
        </div>

        {mode === 'manual' && (
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              {t('Select Global Manual Theme')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.values(HOLIDAY_THEMES).map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setManualTheme(th.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs text-left transition-colors ${
                    manualTheme === th.id
                      ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/30 font-semibold text-rose-700 dark:text-rose-300'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>{th.brandEmoji || '🌐'}</span>
                  <span className="truncate">{th.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 2. Live Geo-IP & Priority Simulator */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              {t('2. Live Geo-IP & Priority Simulator')}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t('Test which holiday theme wins for any market and date without waiting for the calendar.')}
            </p>
          </div>
          <a
            href={`/?country=${simCountry}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {t('Preview Live Site')} ({simCountry})
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <div className="md:col-span-5 space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                {t('Simulated Visitor Market')}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[...TARGET_MARKETS, { code: 'GLOBAL' as MarketCode, name: 'Global / Other', flag: '🌍', timezone: 'UTC' }].map((m) => (
                  <button
                    key={m.code}
                    type="button"
                    onClick={() => setSimCountry(m.code)}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      simCountry === m.code
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {m.flag} {m.code}
                  </button>
                ))}
                <select
                  value={EXTRA_MARKETS.some((e) => e.code === simCountry) ? simCountry : ''}
                  onChange={(e) => {
                    if (e.target.value) setSimCountry(e.target.value);
                  }}
                  className="px-2.5 py-1.5 rounded-md text-xs font-medium border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200"
                >
                  <option value="">+ {t('Other Country...')}</option>
                  {EXTRA_MARKETS.map((m) => (
                    <option key={m.code} value={m.code}>
                      {m.flag} {m.name} ({m.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                {t('Simulated Date')}
              </label>
              <input
                type="date"
                value={simDate}
                onChange={(e) => setSimDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="md:col-span-7 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-zinc-500">{simResult.localDateLabel}</span>
              {simResult.overrideApplied ? (
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  {t('Admin Override Active')}
                </span>
              ) : simResult.winningRule ? (
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                  Priority {simResult.winningRule.priority}
                </span>
              ) : null}
            </div>

            {simResult.theme.id === 'none' ? (
              <div className="text-xs text-zinc-600 dark:text-zinc-400 py-2">
                {t('Result: Normal Default Layout (no active holiday matched for this country & date).')}
              </div>
            ) : (
              <div className="space-y-2">
                <div className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${simResult.theme.ribbonBgClass}`}>
                  <span>{simResult.theme.brandEmoji}</span>
                  <span>{simResult.theme.ribbonText}</span>
                </div>
                <div className="text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>
                    {t('Active Theme')}: <strong>{simResult.theme.label}</strong> ({simResult.theme.effectType})
                  </span>
                </div>
              </div>
            )}

            {simResult.matchingRules.length > 1 && (
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 space-y-1">
                <div className="font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  {t('Overlap resolved automatically (highest priority won):')}
                </div>
                {simResult.matchingRules.map((r, i) => (
                  <div key={r.id} className="flex items-center justify-between">
                    <span>
                      {i === 0 ? '✅ ' : '⏭️ '}
                      {r.name} ({r.scope})
                    </span>
                    <span className="font-mono">P{r.priority}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Per-Country Override Matrix (6 Markets + Extra Countries) */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t('3. Per-Country Overrides (6 Target Markets & Other Countries)')}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t('Keep on "Auto" to follow the priority calendar, or pin/disable a specific market independently when Mode is Auto.')}
            </p>
          </div>
          <select
            value=""
            onChange={(e) => {
              const code = e.target.value;
              if (!code) return;
              setCountryOverrides((prev) => ({
                ...prev,
                [code]: prev[code] || 'auto',
              }));
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-200 shrink-0"
          >
            <option value="">+ {t('Add Other Country')}</option>
            {EXTRA_MARKETS.filter((em) => !(em.code in countryOverrides)).map((em) => (
              <option key={em.code} value={em.code}>
                {em.flag} {em.name} ({em.code})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            ...TARGET_MARKETS,
            ...EXTRA_MARKETS.filter((em) => em.code in countryOverrides),
          ].map((m) => {
            const val = countryOverrides[m.code] || 'auto';
            const isExtra = EXTRA_MARKETS.some((em) => em.code === m.code);
            return (
              <div
                key={m.code}
                className="flex items-center justify-between gap-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <span>{m.flag}</span>
                    <span className="truncate">{m.name}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 truncate">{m.timezone}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <select
                    value={val}
                    onChange={(e) => {
                      const nextVal = e.target.value as 'auto' | HolidayThemeId;
                      setCountryOverrides((prev) => ({ ...prev, [m.code]: nextVal }));
                    }}
                    className="px-2 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 max-w-[145px]"
                  >
                    <option value="auto">{t('Auto (Calendar)')}</option>
                    {Object.values(HOLIDAY_THEMES).map((th) => (
                      <option key={th.id} value={th.id}>
                        {th.brandEmoji ? `${th.brandEmoji} ` : ''}{th.label}
                      </option>
                    ))}
                  </select>
                  {isExtra && (
                    <button
                      type="button"
                      onClick={() => {
                        setCountryOverrides((prev) => {
                          const copy = { ...prev };
                          delete copy[m.code];
                          return copy;
                        });
                      }}
                      className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                      title={t('Remove country override')}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Holiday Rules & Priority Calendar */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-emerald-500" />
              {t('4. Holiday Rules & Non-Overlapping Priority Calendar')}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t('Priority 100 (Global Mega) > Priority 80–90 (Country Major) > Priority 50 (Standard). Higher priority always wins on overlapping dates.')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('Add Custom Rule')}
          </button>
        </div>

        {/* Scope Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: 'all', label: t('All Rules') },
              { id: 'world', label: `🌍 ${t('World Global')}` },
              { id: 'six_markets', label: `🤝 ${t('Shared 6 Markets')}` },
              ...TARGET_MARKETS.map((m) => ({ id: m.code as ScopeFilter, label: `${m.flag} ${m.code}` })),
            ] as { id: ScopeFilter; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setScopeFilter(tab.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                scopeFilter === tab.id
                  ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <select
            value={EXTRA_MARKETS.some((e) => e.code === scopeFilter) ? scopeFilter : ''}
            onChange={(e) => {
              if (e.target.value) setScopeFilter(e.target.value as ScopeFilter);
            }}
            className="px-2.5 py-1 rounded-md text-xs font-medium border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200"
          >
            <option value="">+ {t('Other Country...')}</option>
            {EXTRA_MARKETS.map((m) => (
              <option key={m.code} value={m.code}>
                {m.flag} {m.name} ({m.code})
              </option>
            ))}
          </select>
        </div>

        {/* Rules Table */}
        <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 uppercase text-[10px] tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-2.5 px-3">{t('Active')}</th>
                <th className="py-2.5 px-3">{t('Event & Theme')}</th>
                <th className="py-2.5 px-3">{t('Scope')}</th>
                <th className="py-2.5 px-3">{t('Markets')}</th>
                <th className="py-2.5 px-3">{t('Schedule')}</th>
                <th className="py-2.5 px-3">{t('Priority')}</th>
                <th className="py-2.5 px-3 text-right">{t('Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredRules.map((rule) => {
                const theme = HOLIDAY_THEMES[rule.themeId] || HOLIDAY_THEMES.none;
                return (
                  <tr key={rule.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40">
                    <td className="py-2.5 px-3">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => toggleRuleEnabled(rule.id)}
                        className="rounded border-zinc-300 text-rose-600 focus:ring-rose-500"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <span>{theme.brandEmoji}</span>
                        <span>{rule.name}</span>
                      </div>
                      <div className="text-[11px] text-zinc-500">{theme.label}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          rule.scope === 'world'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                            : rule.scope === 'six_markets'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}
                      >
                        {rule.scope === 'world'
                          ? t('World')
                          : rule.scope === 'six_markets'
                          ? t('6 Markets')
                          : t('Country')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {rule.countries.map((c) => (
                          <span
                            key={c}
                            className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-700 dark:text-zinc-300"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                      {rule.excludeCountries && rule.excludeCountries.length > 0 && (
                        <div className="text-[10px] text-rose-500 mt-0.5">
                          Excl: {rule.excludeCountries.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                      {formatRuleSchedule(rule)}
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={rule.priority}
                        onChange={(e) => updateRulePriority(rule.id, Number(e.target.value))}
                        className="px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono"
                      >
                        <option value={100}>100 (Mega)</option>
                        <option value={90}>90 (High)</option>
                        <option value={85}>85 (Major+)</option>
                        <option value={80}>80 (Country)</option>
                        <option value={50}>50 (Standard)</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {rule.id.startsWith('custom-') && (
                        <button
                          type="button"
                          onClick={() => deleteRule(rule.id)}
                          className="p-1 text-zinc-400 hover:text-rose-600 transition-colors"
                          title={t('Delete custom rule')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Custom Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-lg w-full p-5 space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{t('Add Custom Holiday Rule')}</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('Event Name')}</label>
                <input
                  type="text"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  placeholder="e.g. Bastille Day Deals (France)"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('Scope')}</label>
                  <select
                    value={newRuleScope}
                    onChange={(e) => setNewRuleScope(e.target.value as HolidayRuleScope)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  >
                    <option value="country">{t('Country Specific')}</option>
                    <option value="six_markets">{t('Shared 6 Markets')}</option>
                    <option value="world">{t('World Global')}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('Priority')}</label>
                  <select
                    value={newRulePriority}
                    onChange={(e) => setNewRulePriority(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  >
                    <option value={100}>100 (Global Mega)</option>
                    <option value={85}>85 (Country Major+)</option>
                    <option value={80}>80 (Country Major)</option>
                    <option value={50}>50 (Standard)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('Visual Theme')}</label>
                <select
                  value={newRuleTheme}
                  onChange={(e) => setNewRuleTheme(e.target.value as HolidayThemeId)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                >
                  {Object.values(HOLIDAY_THEMES)
                    .filter((x) => x.id !== 'none')
                    .map((th) => (
                      <option key={th.id} value={th.id}>
                        {th.brandEmoji} {th.label}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block font-medium text-zinc-500 mb-1">Start Mo</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={newStartMonth}
                    onChange={(e) => setNewStartMonth(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  />
                </div>
                <div>
                  <label className="block font-medium text-zinc-500 mb-1">Start Day</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={newStartDay}
                    onChange={(e) => setNewStartDay(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  />
                </div>
                <div>
                  <label className="block font-medium text-zinc-500 mb-1">End Mo</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={newEndMonth}
                    onChange={(e) => setNewEndMonth(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  />
                </div>
                <div>
                  <label className="block font-medium text-zinc-500 mb-1">End Day</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={newEndDay}
                    onChange={(e) => setNewEndDay(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('Include Markets')}</label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_MARKETS.map((m) => (
                    <button
                      key={m.code}
                      type="button"
                      onClick={() => toggleMarketSelection(newRuleCountries, m.code, setNewRuleCountries)}
                      className={`px-2 py-1 rounded border text-[11px] ${
                        newRuleCountries.includes(m.code)
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                          : 'border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      {m.flag} {m.code}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('Exclude Markets (optional)')}</label>
                <div className="flex flex-wrap gap-1.5">
                  {TARGET_MARKETS.map((m) => (
                    <button
                      key={m.code}
                      type="button"
                      onClick={() => toggleMarketSelection(newRuleExclude, m.code, setNewRuleExclude)}
                      className={`px-2 py-1 rounded border text-[11px] ${
                        newRuleExclude.includes(m.code)
                          ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                          : 'border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      {m.flag} {m.code}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('Custom Top Banner Text (optional)')}</label>
                <input
                  type="text"
                  value={newRibbonText}
                  onChange={(e) => setNewRibbonText(e.target.value)}
                  placeholder="Leave blank to use default theme banner"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
              >
                {t('Cancel')}
              </button>
              <button
                type="button"
                onClick={handleAddCustomRule}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
              >
                {t('Add Rule')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
