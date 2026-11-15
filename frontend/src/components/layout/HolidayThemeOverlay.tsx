'use client';

import { useSiteSettings } from '@/lib/admin/useSiteSettings';
import { resolveActiveHolidayTheme } from '@/lib/holidayTheme';
import { useVisitorCountry } from '@/lib/useVisitorCountry';

interface ParticleSpec {
  left: string;
  delay: string;
  duration: string;
  size: string;
  opacity: number;
  mobileVisible: boolean;
}

const PARTICLES: ParticleSpec[] = [
  { left: '4%', delay: '0s', duration: '9s', size: '12px', opacity: 0.7, mobileVisible: true },
  { left: '10%', delay: '2.1s', duration: '11s', size: '16px', opacity: 0.55, mobileVisible: false },
  { left: '16%', delay: '4.2s', duration: '10s', size: '14px', opacity: 0.75, mobileVisible: true },
  { left: '23%', delay: '1.3s', duration: '12.5s', size: '10px', opacity: 0.5, mobileVisible: false },
  { left: '29%', delay: '3.5s', duration: '9.5s', size: '15px', opacity: 0.65, mobileVisible: true },
  { left: '36%', delay: '0.7s', duration: '13s', size: '11px', opacity: 0.55, mobileVisible: false },
  { left: '43%', delay: '5.1s', duration: '10.5s', size: '14px', opacity: 0.7, mobileVisible: true },
  { left: '51%', delay: '2.8s', duration: '11.5s', size: '13px', opacity: 0.6, mobileVisible: false },
  { left: '58%', delay: '0.4s', duration: '9.8s', size: '15px', opacity: 0.75, mobileVisible: true },
  { left: '65%', delay: '4.6s', duration: '12s', size: '11px', opacity: 0.5, mobileVisible: false },
  { left: '72%', delay: '1.9s', duration: '10.2s', size: '14px', opacity: 0.68, mobileVisible: true },
  { left: '79%', delay: '3.9s', duration: '11.8s', size: '12px', opacity: 0.58, mobileVisible: false },
  { left: '86%', delay: '0.9s', duration: '9.2s', size: '15px', opacity: 0.72, mobileVisible: true },
  { left: '93%', delay: '2.4s', duration: '12.2s', size: '11px', opacity: 0.55, mobileVisible: false },
];

const CONFETTI_COLORS = ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#FBBF24'];
const STAR_COLORS = ['#EF4444', '#3B82F6', '#F8FAFC'];

/**
 * Lightweight, pointer-events-none seasonal effect overlay for the public Client Portal.
 * Respects reduced-motion preferences and never intercepts user clicks on coupons.
 */
export default function HolidayThemeOverlay() {
  const { settings } = useSiteSettings();
  const visitorCountry = useVisitorCountry();
  if (!settings.loaded || !settings.holidayEffectsEnabled) {
    return null;
  }

  const theme = resolveActiveHolidayTheme(
    settings.holidayThemeMode,
    settings.holidayThemeManual,
    new Date(),
    visitorCountry,
    settings.holidayCountryOverrides,
    settings.holidayCustomRules
  );
  if (theme.id === 'none' || theme.effectType === 'none') {
    return null;
  }

  if (theme.effectType === 'shimmer') {
    return (
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-1 z-50 bg-gradient-to-r from-[#C62828] via-amber-400 to-[#C62828] opacity-90"
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className="holiday-overlay pointer-events-none fixed inset-0 z-40 overflow-hidden select-none"
      aria-hidden="true"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes holidayFall {
              0% {
                transform: translate3d(0, -10vh, 0) rotate(0deg);
              }
              50% {
                transform: translate3d(18px, 48vh, 0) rotate(180deg);
              }
              100% {
                transform: translate3d(-12px, 105vh, 0) rotate(360deg);
              }
            }
            .holiday-particle {
              position: absolute;
              top: -8vh;
              will-change: transform;
              animation-name: holidayFall;
              animation-timing-function: linear;
              animation-iteration-count: infinite;
            }
            @media (prefers-reduced-motion: reduce) {
              .holiday-overlay {
                display: none !important;
              }
            }
          `,
        }}
      />

      {PARTICLES.map((p, idx) => {
        const visibilityClass = p.mobileVisible ? 'block' : 'hidden sm:block';

        if (theme.effectType === 'confetti') {
          const bg = CONFETTI_COLORS[idx % CONFETTI_COLORS.length];
          return (
            <span
              key={idx}
              className={`holiday-particle rounded-xs ${visibilityClass}`}
              style={{
                left: p.left,
                width: '7px',
                height: '11px',
                backgroundColor: bg,
                opacity: p.opacity,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          );
        }

        if (theme.effectType === 'stars') {
          const color = STAR_COLORS[idx % STAR_COLORS.length];
          return (
            <span
              key={idx}
              className={`holiday-particle ${visibilityClass}`}
              style={{
                left: p.left,
                fontSize: p.size,
                color,
                opacity: p.opacity,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            >
              ★
            </span>
          );
        }

        if (theme.effectType === 'autumn') {
          return (
            <span
              key={idx}
              className={`holiday-particle ${visibilityClass}`}
              style={{
                left: p.left,
                fontSize: p.size,
                opacity: p.opacity * 0.85,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            >
              {idx % 2 === 0 ? '🍂' : '🎃'}
            </span>
          );
        }

        // Default: 'snow'
        return (
          <span
            key={idx}
            className={`holiday-particle text-sky-200 dark:text-white drop-shadow-xs ${visibilityClass}`}
            style={{
              left: p.left,
              fontSize: p.size,
              opacity: p.opacity,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          >
            ❄
          </span>
        );
      })}
    </div>
  );
}
