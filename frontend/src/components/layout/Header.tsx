'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Calendar, 
  Search, 
  Menu as MenuIcon, 
  X, 
  Share2, 
  Zap, 
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const now = new Date();
    const formatted = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(now);
    setCurrentDate(formatted);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { label: 'HOME', href: '/' },
    { label: 'TECH', href: '/category/tech' },
    { label: 'BUSINESS', href: '/category/business' },
    { label: 'ENTERTAINMENT', href: '/category/entertainment' },
    { label: 'US POLITICS', href: '/category/us-politics' },
    { label: 'REVIEWS', href: '/category/reviews' },
    { label: 'LIFESTYLE', href: '/category/lifestyle' },
  ];

  const siteLinks = [
    { label: 'About Us', href: '/about-us' },
    { label: 'Contact Us', href: '/contact-us' },
    { label: 'Editorial Guidelines', href: '/editorial-guidelines' },
    { label: 'Affiliate Disclosure', href: '/affiliate-disclosure' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
  ];

  const tags = [
    'Trump', 'Google', 'Educational Toys', 'Digirdp', 
    'Remote Desktop', 'Affordable Rdp', 'Business Growth', 'Octopiedmind'
  ];

  const flashNews = [
    { title: 'YouCanic Review 2026: Smart Diagnostic Scanners for DIY Mechanics & Dealership Diagnostics', slug: 'youcanic-review-2026' },
    { title: 'Luumun Sleep Review: Circadian Recovery and Sleep Tech Tested for 30 Nights', slug: 'luumun-sleep-review' },
    { title: 'Neo Sabers Review: Heavy Dueling Lightsabers Stress-Tested in Real Swordplay', slug: 'neo-sabers-review' },
    { title: 'Nilight 20-Inch Curved LED Light Bar: 500-Mile Extreme Off-Road Lumens Test', slug: 'nilight-led-light-bar-review' },
    { title: 'Google Hardware & AI Ecosystem 2026: Cross-Platform Productivity & Syncing Deep-Dive', slug: 'google-ai-hardware-ecosystem-review-2026' },
    { title: 'US Trade Policies & Consumer Tech: Supply Chain Adjustments & Retail Price Forecasts', slug: 'trump-tariffs-ecommerce-consumer-goods-impact-2026' },
  ];

  return (
    <header className="w-full bg-white border-b border-[#E7E7E5]">
      
      {/* 1. TOP UTILITY BAR (Very compact, minimal, quiet) */}
      <div className="bg-[#F8F8F6] border-b border-[#E7E7E5] text-[11px] text-[#737373] py-1.5 px-4 sm:px-6">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Date + Editorial Site Links */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#171717]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C62828]" />
              <span>{currentDate || 'Thu, Oct 22, 2026'}</span>
            </span>

            <span className="text-[#E7E7E5] hidden md:inline">|</span>

            {/* Quick Links */}
            <nav className="hidden md:flex items-center gap-3 text-[11px] font-normal text-[#737373]">
              {siteLinks.map((link) => (
                <Link 
                  key={link.label}
                  href={link.href} 
                  className="hover:text-[#171717] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Social & Staff CMS */}
          <div className="flex items-center gap-4 text-[#737373]">
            <div className="hidden sm:flex items-center gap-3">
              <span className="hover:text-[#171717] transition-colors cursor-pointer" title="Share"><Share2 size={12} /></span>
              <span className="hover:text-[#171717] transition-colors cursor-pointer" title="Instagram">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </span>
            </div>
            <Link 
              href="/login" 
              className="text-[11px] font-medium text-[#737373] hover:text-[#171717] transition-colors"
            >
              Staff CMS
            </Link>
          </div>

        </div>
      </div>

      {/* 2. BRANDING MASTHEAD (Light, Confident Editorial Typography, Separated Partner Unit) */}
      <div className="bg-white py-6 px-4 sm:px-6 border-b border-[#E7E7E5]">
        <div className="max-w-[1240px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Logo & Subtitle */}
          <Link href="/" className="flex flex-col text-center lg:text-left group shrink-0">
            <span className="font-editorial text-4xl sm:text-5xl lg:text-[54px] font-bold text-[#171717] tracking-tight leading-none">
              Bargorya<span className="text-[#C62828]">.</span>
            </span>
            <span className="text-[11px] tracking-widest uppercase font-semibold text-[#737373] mt-2">
              The Independent Product Review & Smart Deals Journal
            </span>
          </Link>

          {/* 728x90 Advertisement Slot (Visually distinct from brand identity) */}
          <div className="w-full lg:max-w-[728px] h-[90px] rounded-lg bg-[#171717] text-white flex items-center justify-between px-5 sm:px-7 relative overflow-hidden border border-[#E7E7E5]/20">
            <div className="space-y-1 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase font-bold tracking-widest text-[#EAB308] bg-[#EAB308]/15 px-2 py-0.5 rounded">
                  Partner Spotlight
                </span>
                <span className="text-[10px] text-[#737373] hidden sm:inline">• Vetted Promotion</span>
              </div>
              <h4 className="text-sm sm:text-base font-semibold text-white tracking-wide">
                Seasonal Consumer Tech & Smart Home Clearance Deals
              </h4>
              <p className="text-[11px] text-[#A8A8A2] line-clamp-1 hidden sm:block">
                Verified promo codes tested against live merchant checkouts.
              </p>
            </div>

            <div className="shrink-0 relative z-10 ml-4">
              <Link
                href="/about-us"
                className="bg-[#C62828] hover:bg-[#B71C1C] text-white font-semibold text-xs px-3.5 py-1.5 rounded transition inline-flex items-center gap-1.5"
              >
                <span>Discover</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* 3. PRIMARY EDITORIAL NAVIGATION (Restrained, Sticky, Clear Active Indicator) */}
      <nav className="bg-white border-b border-[#E7E7E5] sticky top-0 z-40">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex items-center justify-between">
          
          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-xs font-semibold tracking-wider uppercase px-3.5 py-3 transition-colors border-b-2 ${
                    isActive
                      ? 'border-[#C62828] text-[#C62828]'
                      : 'border-transparent text-[#171717] hover:text-[#C62828]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden py-2.5">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-[#171717] hover:text-[#C62828] rounded flex items-center gap-1.5 text-xs font-semibold"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
              <span>Menu</span>
            </button>
          </div>

          {/* Search Trigger */}
          <div className="relative py-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 text-[#737373] hover:text-[#171717] transition-colors flex items-center gap-2 text-xs"
              aria-label="Search articles"
            >
              <Search size={16} />
              <span className="hidden sm:inline font-medium">Search</span>
            </button>
          </div>

        </div>

        {/* Search Dropdown */}
        {searchOpen && (
          <div className="border-t border-[#E7E7E5] p-4 bg-[#F8F8F6] animate-fadeIn">
            <div className="max-w-xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search size={17} className="absolute left-3.5 text-[#737373] pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, lab reviews, buying guides, coupons..."
                  className="w-full pl-10 pr-24 py-2 bg-white border border-[#E7E7E5] rounded-md text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#171717]"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-1.5 bg-[#171717] hover:bg-[#C62828] text-white text-xs font-medium px-3.5 py-1.5 rounded transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E7E7E5] p-5 bg-white space-y-5 animate-fadeIn shadow-lg">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C62828] mb-2 block">
                Editorial Categories
              </span>
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block px-3 py-2 text-sm font-medium text-[#171717] hover:bg-[#F8F8F6] hover:text-[#C62828] rounded transition"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-[#E7E7E5] pt-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#737373] mb-2 block">
                About Bargorya
              </span>
              <div className="space-y-1">
                {siteLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block px-3 py-1.5 text-xs text-[#737373] hover:text-[#171717] transition"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* 4. DEDICATED FLASH NEWS TICKER (Single line continuous auto-scroll) */}
      <div className="border-b border-[#E7E7E5] bg-[#F8F8F6] py-2 px-4 sm:px-6 overflow-hidden select-none">
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes flashNewsMarquee {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
          .flash-news-track {
            display: inline-flex;
            white-space: nowrap;
            will-change: transform;
            animation: flashNewsMarquee 35s linear infinite;
          }
          .flash-news-track:hover {
            animation-play-state: paused;
          }
          @keyframes redLivePulse {
            0%, 100% {
              opacity: 1;
              box-shadow: 0 0 0 0 rgba(198, 40, 40, 0.7);
            }
            50% {
              opacity: 0.35;
              box-shadow: 0 0 0 5px rgba(198, 40, 40, 0);
            }
          }
          .live-blink-dot {
            animation: redLivePulse 1.4s infinite cubic-bezier(0.4, 0, 0.6, 1);
          }
        `}} />
        
        <div className="max-w-[1240px] mx-auto flex items-center h-6 relative">
          
          {/* Left Fixed Flash News Badge */}
          <div className="z-10 bg-[#F8F8F6] pr-3 shrink-0 flex items-center border-r border-[#E7E7E5] mr-3">
            <span className="bg-[#C62828] text-white font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shrink-0 flex items-center gap-1 shadow-2xs whitespace-nowrap">
              <Zap size={11} className="fill-white" />
              <span>Flash News</span>
            </span>
          </div>

          {/* Marquee Ticker Track */}
          <div className="overflow-hidden flex-1 relative h-full flex items-center">
            <div className="flash-news-track items-center text-xs">
              {[...flashNews, ...flashNews].map((news, idx) => (
                <Link
                  key={idx}
                  href={`/post/${news.slug}`}
                  className="inline-flex items-center text-xs sm:text-sm text-[#171717] hover:text-[#C62828] font-medium whitespace-nowrap transition-colors px-6 group shrink-0"
                >
                  {/* Pulsing red live indicator */}
                  <span className="relative flex h-2 w-2 mr-2.5 shrink-0 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C62828] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C62828] live-blink-dot" />
                  </span>
                  <span className="group-hover:underline">{news.title}</span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

    </header>
  );
}
