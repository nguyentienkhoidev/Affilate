'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  RotateCcw,
  RotateCw,
  RemoveFormatting,
  Eye,
  Code2,
  Tag,
  AlertCircle,
  HelpCircle,
  X,
  Upload,
  Check,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Highlighter,
  Type,
  Trash2,
  ExternalLink,
  MousePointerClick,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown,
  Copy,
  Layers,
  Sparkles,
  LayoutTemplate,
  ChevronDown,
  Maximize2,
  Minimize2,
  FolderOpen,
  PlusCircle,
  Search,
  ListTree,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Trophy,
  Scale,
  LayoutGrid,
  Table,
  FileText,
  Subscript,
  Superscript,
  Indent,
  Outdent,
  ZoomIn,
  ZoomOut,
  Sliders,
  ArrowLeft,
  Settings,
  Monitor,
  Smartphone,
  Tablet,
} from 'lucide-react';
import MediaLibraryModal from './MediaLibraryModal';
import MediaTagInput from './MediaTagInput';
import { useOptionalToast } from '@/context/ToastContext';
import { mediaService } from '@/services/mediaService';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
  initialPaperView?: boolean;
}

const TEXT_COLORS = [
  { label: 'Black / Dark', value: '#171717' },
  { label: 'Brand Crimson', value: '#C62828' },
  { label: 'Emerald Green', value: '#059669' },
  { label: 'Royal Blue', value: '#2563EB' },
  { label: 'Amber Orange', value: '#D97706' },
  { label: 'Violet Purple', value: '#7C3AED' },
  { label: 'Muted Gray', value: '#71717A' },
];

const HIGHLIGHT_COLORS = [
  { label: 'No Highlight', value: 'transparent' },
  { label: 'Yellow Glow', value: '#FEF08A' },
  { label: 'Green Glow', value: '#BBF7D0' },
  { label: 'Pink Rose', value: '#FECDD3' },
  { label: 'Soft Blue', value: '#BFDBFE' },
  { label: 'Warm Orange', value: '#FED7AA' },
];

const FONT_SIZES = [
  { label: 'Small (13px)', value: '13px' },
  { label: 'Normal (15px)', value: '15px' },
  { label: 'Medium (18px)', value: '18px' },
  { label: 'Large (22px)', value: '22px' },
  { label: 'Huge (26px)', value: '26px' },
];

export const FONT_FAMILIES = [
  { label: 'Inter (Modern Sans)', value: 'Inter, system-ui, sans-serif' },
  { label: 'Times New Roman (Serif)', value: '"Times New Roman", Times, serif' },
  { label: 'Arial (Standard)', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Calibri (Office)', value: 'Calibri, Candara, Segoe, sans-serif' },
  { label: 'Georgia (Editorial)', value: 'Georgia, serif' },
  { label: 'Roboto (Tech)', value: 'Roboto, sans-serif' },
  { label: 'Courier New (Code/Mono)', value: '"Courier New", Courier, monospace' },
];

export const FONT_SIZES_WORD = [
  '11px', '12px', '13px', '14px', '15px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '42px', '48px', '60px', '72px'
];

interface ComponentTemplate {
  id: string;
  category: string;
  name: string;
  description: string;
  badge?: string;
  previewColor: string;
  html: string;
}

const COMPONENT_TEMPLATES: ComponentTemplate[] = [
  {
    id: 'overview-section',
    category: 'Article Structure',
    name: 'Overview & Key Highlights Section',
    description: 'Standard article card with Crimson accent bar, section heading, and in-depth analysis paragraphs.',
    previewColor: 'bg-white border-slate-200 text-slate-800',
    badge: 'Most Popular',
    html: `<section class="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4 article-component my-6 relative">
  <div contenteditable="false" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(0,0,0,0.06); padding-bottom: 8px; margin-bottom: 12px; user-select: none;">
    <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; display: flex; align-items: center; gap: 6px;">
      <span style="width: 6px; height: 6px; border-radius: 9999px; background-color: #C62828;"></span>
      Overview & Key Highlights Card
    </span>
    <button type="button" class="box-delete-btn" style="background: #ffffff; color: #dc2626; border: 1px solid #fecaca; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; cursor: pointer;">
      🗑️ Delete Card
    </button>
  </div>
  <div class="flex items-center gap-3">
    <span class="w-1.5 h-6 bg-[#C62828] rounded-full"></span>
    <h2 class="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">1. Product Overview & Key Highlights</h2>
  </div>
  <p class="text-slate-600 leading-relaxed">Detailed overview of the product, standout engineering features, and first-hand impressions from our lab testing sessions.</p>
  <p class="text-slate-600 leading-relaxed">Our editorial team evaluated build durability, real-world performance, and compatibility compared against leading competitors in its class.</p>
</section>`,
  },
  {
    id: 'benchmark-section',
    category: 'Article Structure',
    name: 'Hands-On Testing & Lab Benchmark Section',
    description: 'Article section featuring a highlighted Lab Benchmark Summary 9.4/10 score callout box.',
    previewColor: 'bg-white border-slate-200 text-slate-800',
    badge: 'Lab Benchmark',
    html: `<section class="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4 article-component my-6 relative">
  <div contenteditable="false" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(0,0,0,0.06); padding-bottom: 8px; margin-bottom: 12px; user-select: none;">
    <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; display: flex; align-items: center; gap: 6px;">
      <span style="width: 6px; height: 6px; border-radius: 9999px; background-color: #C62828;"></span>
      Lab Benchmark Card
    </span>
    <button type="button" class="box-delete-btn" style="background: #ffffff; color: #dc2626; border: 1px solid #fecaca; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; cursor: pointer;">
      🗑️ Delete Card
    </button>
  </div>
  <div class="flex items-center gap-3">
    <span class="w-1.5 h-6 bg-[#C62828] rounded-full"></span>
    <h2 class="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">2. Real-World Performance & Lab Benchmark Results</h2>
  </div>
  <p class="text-slate-600 leading-relaxed">Under standardized stress-testing conditions, the unit demonstrated consistent output stability and exceptional thermal reliability.</p>
  <div class="bg-slate-50 border-l-4 border-[#C62828] p-4 rounded-r-xl space-y-1">
    <p class="font-bold text-slate-900 text-sm">Lab Benchmark Summary: 9.4 / 10</p>
    <p class="text-xs text-slate-600 leading-relaxed">Composite testing score across build precision, acoustic/thermal dissipation, and everyday ergonomic comfort.</p>
  </div>
</section>`,
  },
  {
    id: 'deal-promo-box',
    category: 'Deals & Promos',
    name: 'Exclusive Deal & Promo Voucher Box',
    description: 'Dashed crimson gradient deal box displaying discounted price, promo code badge, and Claim Deal CTA button.',
    previewColor: 'bg-rose-50/50 border-rose-300 text-rose-950',
    badge: 'High Conversion',
    html: `<div class="editorial-box my-6 rounded-2xl border-2 border-dashed border-[#C62828] bg-gradient-to-br from-red-50 via-white to-orange-50 p-6 sm:p-7 shadow-xs relative overflow-hidden article-component" data-box-type="deal">
  <div contenteditable="false" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; user-select: none;">
    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase bg-[#C62828] text-white shadow-xs">
      EXCLUSIVE DEAL - SAVE 45%
    </span>
    <div style="display: flex; align-items: center; gap: 8px;">
      <span class="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-md">Verified active today</span>
      <button type="button" class="box-delete-btn" style="background: #ffffff; color: #dc2626; border: 1px solid #fecaca; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; cursor: pointer;">
        🗑️ Delete Deal Box
      </button>
    </div>
  </div>
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
    <div class="space-y-1.5 min-w-0 flex-1">
      <h3 class="deal-title text-lg sm:text-xl font-black text-slate-950">Exclusive Reader Discount Offer</h3>
      <p class="text-xs sm:text-sm text-slate-600">Apply our exclusive promo code at the official merchant checkout for an instant price reduction.</p>
      <div class="flex items-baseline gap-2 pt-1 flex-wrap">
        <span class="deal-price text-2xl sm:text-3xl font-black text-[#C62828]">$49.99</span>
        <span class="deal-original-price text-sm text-slate-400 line-through">$89.99</span>
        <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Save $40</span>
      </div>
    </div>
    <div class="flex flex-col items-start sm:items-end gap-2 shrink-0">
      <div class="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs shadow-xs">
        <span class="text-slate-500 font-medium">Promo Code:</span>
        <span class="deal-code font-mono font-black text-red-600 tracking-wider">HEYGOODLY20</span>
      </div>
      <a href="https://example.com/deal" target="_blank" rel="noopener noreferrer nofollow" class="deal-button inline-flex items-center gap-2 bg-[#C62828] hover:bg-[#B71C1C] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow transition">
        Claim Deal at Official Store →
      </a>
    </div>
  </div>
</div>`,
  },
  {
    id: 'pros-cons-grid',
    category: 'Reviews & Comparisons',
    name: 'Pros & Cons Comparison Grid',
    description: '2-column contrast grid: Emerald column highlights strengths, Rose column lists trade-offs to consider.',
    previewColor: 'bg-emerald-50/50 border-emerald-200 text-emerald-950',
    badge: 'Comparison',
    html: `<div class="editorial-box my-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs article-component relative" data-box-type="pros-cons">
  <div contenteditable="false" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; user-select: none;">
    <h3 class="text-base font-black text-slate-900 flex items-center gap-2" style="margin: 0;">
      <span class="text-[#C62828]">⚖️</span> Pros & Cons Breakdown
    </h3>
    <button type="button" class="box-delete-btn" style="background: #ffffff; color: #dc2626; border: 1px solid #fecaca; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; cursor: pointer;">
      🗑️ Delete Grid
    </button>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-2">
      <h4 class="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
        <span>✓</span> KEY STRENGTHS (PROS)
      </h4>
      <ul class="text-xs text-slate-700 space-y-1.5 list-disc pl-4 leading-relaxed">
        <li>Rugged build quality with high dust and water resistance rating</li>
        <li>Broad compatibility across popular models and platforms</li>
        <li>24-month official warranty backed by lifetime technical support</li>
      </ul>
    </div>
    <div class="bg-rose-50/60 border border-rose-200 rounded-xl p-4 space-y-2">
      <h4 class="text-xs font-black uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
        <span>✕</span> THINGS TO CONSIDER (CONS)
      </h4>
      <ul class="text-xs text-slate-700 space-y-1.5 list-disc pl-4 leading-relaxed">
        <li>Requires basic mounting tools for optimal installation</li>
        <li>Exclusive promo code redemptions are capped daily</li>
      </ul>
    </div>
  </div>
</div>`,
  },
  {
    id: 'verdict-dark-box',
    category: 'Article Structure',
    name: 'Editorial Verdict Dark Card',
    description: 'Premium dark slate card (Slate-900) with Editor’s Choice badge and gold composite score.',
    previewColor: 'bg-slate-900 border-slate-800 text-white',
    badge: 'Editor’s Choice',
    html: `<section class="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md space-y-4 article-component my-6 relative" style="background-color: #0f172a; color: #ffffff;">
  <div contenteditable="false" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 8px; margin-bottom: 8px; user-select: none;">
    <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; display: flex; align-items: center; gap: 6px;">
      <span style="width: 6px; height: 6px; border-radius: 9999px; background-color: #f59e0b;"></span>
      Editorial Verdict Card
    </span>
    <button type="button" class="box-delete-btn" style="background: #1e293b; color: #f87171; border: 1px solid #334155; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; cursor: pointer;">
      🗑️ Delete Card
    </button>
  </div>
  <div class="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
    <h3 class="text-lg font-black tracking-tight text-white flex items-center gap-2">
      <span>🏆</span> EDITORIAL VERDICT
    </h3>
    <span class="text-xs font-bold bg-[#C62828] text-white px-3 py-1 rounded-full">Editor's Choice</span>
  </div>
  <p class="text-slate-300 text-sm leading-relaxed">If you are looking for an ideal balance between reliable performance and smart value, this stands out as one of the top recommendations in its category right now.</p>
  <div class="flex items-center gap-4 pt-2">
    <div class="text-3xl sm:text-4xl font-black text-amber-400">9.6 / 10</div>
    <div class="text-xs text-slate-400">Rated by our hardware testing team and verified buyer community.</div>
  </div>
</section>`,
  },
  {
    id: 'full-media-figure',
    category: 'Images & Media',
    name: 'Full-Width Image Figure with Caption',
    description: 'Full-width image container with 2xl rounded corners, subtle border, and centered italic caption.',
    previewColor: 'bg-slate-100 border-slate-300 text-slate-700',
    badge: 'Media Figure',
    html: `<figure class="my-6 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 article-component relative" data-box-type="image">
  <div contenteditable="false" style="position: absolute; top: 10px; right: 10px; z-index: 10; user-select: none;">
    <button type="button" class="box-delete-btn" style="background: rgba(0,0,0,0.75); color: #ffffff; border: 1px solid rgba(255,255,255,0.2); font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 6px; cursor: pointer; backdrop-filter: blur(4px);">
      🗑️ Delete Image
    </button>
  </div>
  <img src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&auto=format&fit=crop&q=80" alt="Product hands-on testing photo" class="w-full h-auto object-cover max-h-[460px]" />
  <figcaption class="p-3 text-center text-xs text-slate-500 italic border-t border-slate-100 bg-white">
    Hands-on product sample evaluated under natural lighting conditions
  </figcaption>
</figure>`,
  },
  {
    id: 'split-media-text',
    category: 'Images & Media',
    name: '2-Column Split: Image Left + Feature Copy Right',
    description: 'Balanced 2-column layout pairing a close-up product photo on the left with feature commentary on the right.',
    previewColor: 'bg-white border-slate-200 text-slate-800',
    badge: 'Media + Text',
    html: `<section class="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs article-component my-6 relative">
  <div contenteditable="false" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(0,0,0,0.06); padding-bottom: 8px; margin-bottom: 12px; user-select: none;">
    <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; display: flex; align-items: center; gap: 6px;">
      <span style="width: 6px; height: 6px; border-radius: 9999px; background-color: #C62828;"></span>
      2-Column Media Split
    </span>
    <button type="button" class="box-delete-btn" style="background: #ffffff; color: #dc2626; border: 1px solid #fecaca; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; cursor: pointer;">
      🗑️ Delete Card
    </button>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
    <div class="rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
      <img src="https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80" alt="Product design close-up" class="w-full h-auto object-cover" />
    </div>
    <div class="space-y-3">
      <span class="text-xs font-bold uppercase tracking-wider text-[#C62828]">Design & Craftsmanship</span>
      <h3 class="text-xl font-black text-slate-950">Precision Engineering Down to Every Detail</h3>
      <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">Constructed with certified high-durability materials, refined finishes, and a solid, confidence-inspiring tactile feel.</p>
    </div>
  </div>
</section>`,
  },
  {
    id: 'cta-action-banner',
    category: 'Deals & Promos',
    name: 'Fast-Action Checkout CTA Banner',
    description: 'Sleek dark horizontal banner designed to drive high-intent clicks to the merchant checkout.',
    previewColor: 'bg-slate-900 border-slate-800 text-white',
    badge: 'CTA Banner',
    html: `<div class="editorial-box my-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-6 sm:p-7 shadow-lg article-component relative" data-box-type="banner">
  <div contenteditable="false" style="display: flex; align-items: center; justify-content: flex-end; margin-bottom: 8px; user-select: none;">
    <button type="button" class="box-delete-btn" style="background: rgba(255,255,255,0.1); color: #f87171; border: 1px solid rgba(255,255,255,0.15); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; cursor: pointer;">
      🗑️ Delete Banner
    </button>
  </div>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
    <div class="space-y-1 text-center sm:text-left">
      <h3 class="text-base sm:text-lg font-black text-white">Ready to Experience It Yourself?</h3>
      <p class="text-xs text-slate-300">Order today to unlock free nationwide shipping and a 24-month official manufacturer warranty.</p>
    </div>
    <a href="https://example.com/buy" target="_blank" rel="noopener noreferrer nofollow" class="cta-button shrink-0 inline-flex items-center gap-2 bg-[#C62828] hover:bg-[#B71C1C] text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md transition">
      Shop Now at Special Price →
    </a>
  </div>
</div>`,
  },
];

export interface TemplateParamField {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'url';
  placeholder?: string;
  help?: string;
}

export function getDefaultParamsForTemplate(templateId: string): Record<string, string> {
  switch (templateId) {
    case 'overview-section':
      return {
        badge: 'Overview & Key Highlights Card',
        title: '1. Product Overview & Key Highlights',
        p1: 'Detailed overview of the product, standout engineering features, and first-hand impressions from our lab testing sessions.',
        p2: 'Our editorial team evaluated build durability, real-world performance, and compatibility compared against leading competitors in its class.',
      };
    case 'benchmark-section':
      return {
        badge: 'Lab Benchmark Card',
        title: '2. Real-World Performance & Lab Benchmark Results',
        bodyText: 'Under standardized stress-testing conditions, the unit demonstrated consistent output stability and exceptional thermal reliability.',
        scoreTitle: 'Lab Benchmark Summary: 9.4 / 10',
        scoreDesc: 'Composite testing score across build precision, acoustic/thermal dissipation, and everyday ergonomic comfort.',
      };
    case 'deal-promo-box':
      return {
        badge: 'EXCLUSIVE DEAL - SAVE 45%',
        verifiedNote: 'Verified active today',
        title: 'Exclusive Reader Discount Offer',
        desc: 'Apply our exclusive promo code at the official merchant checkout for an instant price reduction.',
        dealPrice: '$49.99',
        originalPrice: '$89.99',
        savings: 'Save $40',
        couponCode: 'HEYGOODLY20',
        buttonText: 'Claim Deal at Official Store →',
        buttonUrl: 'https://example.com/deal',
      };
    case 'pros-cons-grid':
      return {
        title: 'Pros & Cons Breakdown',
        pros: 'Rugged build quality with high dust and water resistance rating\nBroad compatibility across popular models and platforms\n24-month official warranty backed by lifetime technical support',
        cons: 'Requires basic mounting tools for optimal installation\nExclusive promo code redemptions are capped daily',
      };
    case 'verdict-dark-box':
      return {
        badge: "Editor's Choice",
        title: 'EDITORIAL VERDICT',
        conclusion: 'If you are looking for an ideal balance between reliable performance and smart value, this stands out as one of the top recommendations in its category right now.',
        score: '9.6 / 10',
        scoreDesc: 'Rated by our hardware testing team and verified buyer community.',
      };
    case 'full-media-figure':
      return {
        imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&auto=format&fit=crop&q=80',
        caption: 'Hands-on product sample evaluated under natural lighting conditions',
      };
    case 'split-media-text':
      return {
        tag: 'Design & Craftsmanship',
        title: 'Precision Engineering Down to Every Detail',
        desc: 'Constructed with certified high-durability materials, refined finishes, and a solid, confidence-inspiring tactile feel.',
        imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80',
      };
    case 'cta-action-banner':
      return {
        title: 'Ready to Experience It Yourself?',
        desc: 'Order today to unlock free nationwide shipping and a 24-month official manufacturer warranty.',
        buttonText: 'Shop Now at Special Price →',
        buttonUrl: 'https://example.com/buy',
      };
    default:
      return {};
  }
}

export function getTemplateParamFields(templateId: string): TemplateParamField[] {
  switch (templateId) {
    case 'overview-section':
      return [
        { key: 'badge', label: 'Card Top Badge / Label', placeholder: 'Overview & Key Highlights Card' },
        { key: 'title', label: 'Section Heading (H2)', placeholder: '1. Product Overview & Key Highlights' },
        { key: 'p1', label: 'Analysis Paragraph 1', type: 'textarea', placeholder: 'Overview analysis content...' },
        { key: 'p2', label: 'Analysis Paragraph 2', type: 'textarea', placeholder: 'Durability and testing notes...' },
      ];
    case 'benchmark-section':
      return [
        { key: 'badge', label: 'Card Badge', placeholder: 'Lab Benchmark Card' },
        { key: 'title', label: 'Section Heading', placeholder: '2. Real-World Performance & Lab Benchmark Results' },
        { key: 'bodyText', label: 'Opening Commentary', type: 'textarea', placeholder: 'Testing conditions commentary...' },
        { key: 'scoreTitle', label: 'Score Summary Callout Title', placeholder: 'Lab Benchmark Summary: 9.4 / 10' },
        { key: 'scoreDesc', label: 'Score Breakdown Description', type: 'textarea', placeholder: 'Composite testing score...' },
      ];
    case 'deal-promo-box':
      return [
        { key: 'title', label: 'Deal Title / Product Name *', placeholder: 'Exclusive Reader Discount Offer' },
        { key: 'badge', label: 'Top Promo Badge', placeholder: 'EXCLUSIVE DEAL - SAVE 45%' },
        { key: 'verifiedNote', label: 'Verification Badge Note', placeholder: 'Verified active today' },
        { key: 'dealPrice', label: 'Deal Price *', placeholder: '$49.99' },
        { key: 'originalPrice', label: 'Original List Price (Strikethrough)', placeholder: '$89.99' },
        { key: 'savings', label: 'Savings Badge', placeholder: 'Save $40 or 45% Off' },
        { key: 'couponCode', label: 'Promo / Coupon Code', placeholder: 'HEYGOODLY20' },
        { key: 'desc', label: 'Offer Description', type: 'textarea', placeholder: 'Apply promo code at checkout...' },
        { key: 'buttonText', label: 'CTA Button Label', placeholder: 'Claim Deal at Official Store →' },
        { key: 'buttonUrl', label: 'Affiliate / Destination URL *', type: 'url', placeholder: 'https://example.com/affiliate-deal' },
      ];
    case 'pros-cons-grid':
      return [
        { key: 'title', label: 'Comparison Grid Title', placeholder: 'Pros & Cons Breakdown' },
        { key: 'pros', label: 'PROS List (one item per line)', type: 'textarea', placeholder: 'Rugged build quality\n24-month warranty\n...' },
        { key: 'cons', label: 'CONS List (one item per line)', type: 'textarea', placeholder: 'Requires basic tools\nLimited daily promo redemptions\n...' },
      ];
    case 'verdict-dark-box':
      return [
        { key: 'title', label: 'Verdict Heading', placeholder: 'EDITORIAL VERDICT' },
        { key: 'badge', label: 'Recommendation Badge', placeholder: "Editor's Choice" },
        { key: 'score', label: 'Rating Score', placeholder: '9.6 / 10' },
        { key: 'conclusion', label: 'Verdict Summary / Buying Advice', type: 'textarea', placeholder: 'If you are looking for...' },
        { key: 'scoreDesc', label: 'Rating Attribution Note', placeholder: 'Rated by our hardware testing team...' },
      ];
    case 'full-media-figure':
      return [
        { key: 'imageUrl', label: 'Image URL *', type: 'url', placeholder: 'https://images.unsplash.com/...' },
        { key: 'caption', label: 'Image Caption Below', placeholder: 'Hands-on product sample...' },
      ];
    case 'split-media-text':
      return [
        { key: 'tag', label: 'Eyebrow Tag', placeholder: 'Design & Craftsmanship' },
        { key: 'title', label: 'Section Heading', placeholder: 'Precision Engineering Down to Every Detail' },
        { key: 'desc', label: 'Feature Copy Paragraph', type: 'textarea', placeholder: 'Constructed with certified materials...' },
        { key: 'imageUrl', label: 'Image URL', type: 'url', placeholder: 'https://images.unsplash.com/...' },
      ];
    case 'cta-action-banner':
      return [
        { key: 'title', label: 'Banner Heading', placeholder: 'Ready to Experience It Yourself?' },
        { key: 'desc', label: 'Call-to-Action Description', type: 'textarea', placeholder: 'Order today to unlock free shipping...' },
        { key: 'buttonText', label: 'Button Label', placeholder: 'Shop Now at Special Price →' },
        { key: 'buttonUrl', label: 'Affiliate Destination URL *', type: 'url', placeholder: 'https://example.com/buy' },
      ];
    default:
      return [];
  }
}

export function buildTemplateHTML(templateId: string, params: Record<string, string>): string {
  switch (templateId) {
    case 'overview-section': {
      const badge = params.badge || 'Overview & Key Highlights Card';
      const title = params.title || '1. Product Overview & Key Highlights';
      const p1 = params.p1 || '';
      const p2 = params.p2 || '';
      return `<section class="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4 article-component my-6 relative">
  <div contenteditable="false" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(0,0,0,0.06); padding-bottom: 8px; margin-bottom: 12px; user-select: none;">
    <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; display: flex; align-items: center; gap: 6px;">
      <span style="width: 6px; height: 6px; border-radius: 9999px; background-color: #C62828;"></span>
      ${badge}
    </span>
    <button type="button" class="box-delete-btn" style="background: #ffffff; color: #dc2626; border: 1px solid #fecaca; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; cursor: pointer;">
      🗑️ Delete Card
    </button>
  </div>
  <div class="flex items-center gap-3">
    <span class="w-1.5 h-6 bg-[#C62828] rounded-full"></span>
    <h2 class="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">${title}</h2>
  </div>
  ${p1 ? `<p class="text-slate-600 leading-relaxed">${p1}</p>` : ''}
  ${p2 ? `<p class="text-slate-600 leading-relaxed">${p2}</p>` : ''}
</section>`;
    }

    case 'benchmark-section': {
      const badge = params.badge || 'Lab Benchmark Card';
      const title = params.title || '2. Real-World Performance & Lab Benchmark Results';
      const bodyText = params.bodyText || '';
      const scoreTitle = params.scoreTitle || 'Lab Benchmark Summary: 9.4 / 10';
      const scoreDesc = params.scoreDesc || '';
      return `<section class="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4 article-component my-6 relative">
  <div contenteditable="false" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(0,0,0,0.06); padding-bottom: 8px; margin-bottom: 12px; user-select: none;">
    <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; display: flex; align-items: center; gap: 6px;">
      <span style="width: 6px; height: 6px; border-radius: 9999px; background-color: #C62828;"></span>
      ${badge}
    </span>
    <button type="button" class="box-delete-btn" style="background: #ffffff; color: #dc2626; border: 1px solid #fecaca; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; cursor: pointer;">
      🗑️ Delete Card
    </button>
  </div>
  <div class="flex items-center gap-3">
    <span class="w-1.5 h-6 bg-[#C62828] rounded-full"></span>
    <h2 class="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">${title}</h2>
  </div>
  ${bodyText ? `<p class="text-slate-600 leading-relaxed">${bodyText}</p>` : ''}
  <div class="bg-slate-50 border-l-4 border-[#C62828] p-4 rounded-r-xl space-y-1">
    <p class="font-bold text-slate-900 text-sm">${scoreTitle}</p>
    ${scoreDesc ? `<p class="text-xs text-slate-600 leading-relaxed">${scoreDesc}</p>` : ''}
  </div>
</section>`;
    }

    case 'deal-promo-box': {
      const badge = params.badge || 'EXCLUSIVE DEAL - SAVE 45%';
      const verifiedNote = params.verifiedNote || 'Verified active today';
      const title = params.title || 'Exclusive Reader Discount Offer';
      const desc = params.desc || '';
      const dealPrice = params.dealPrice || '$49.99';
      const originalPrice = params.originalPrice || '';
      const savings = params.savings || '';
      const couponCode = params.couponCode || '';
      const buttonText = params.buttonText || 'Claim Deal at Official Store →';
      const buttonUrl = params.buttonUrl || 'https://example.com/deal';
      return `<div class="editorial-box my-6 rounded-2xl border-2 border-dashed border-[#C62828] bg-gradient-to-br from-red-50 via-white to-orange-50 p-6 sm:p-7 shadow-xs relative overflow-hidden article-component" data-box-type="deal">
  <div contenteditable="false" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; user-select: none;">
    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase bg-[#C62828] text-white shadow-xs">
      ${badge}
    </span>
    <div style="display: flex; align-items: center; gap: 8px;">
      ${verifiedNote ? `<span class="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-md">${verifiedNote}</span>` : ''}
      <button type="button" class="box-delete-btn" style="background: #ffffff; color: #dc2626; border: 1px solid #fecaca; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; cursor: pointer;">
        🗑️ Delete Deal Box
      </button>
    </div>
  </div>
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
    <div class="space-y-1.5 min-w-0 flex-1">
      <h3 class="deal-title text-lg sm:text-xl font-black text-slate-950">${title}</h3>
      ${desc ? `<p class="text-xs sm:text-sm text-slate-600">${desc}</p>` : ''}
      <div class="flex items-baseline gap-2 pt-1 flex-wrap">
        <span class="deal-price text-2xl sm:text-3xl font-black text-[#C62828]">${dealPrice}</span>
        ${originalPrice ? `<span class="deal-original-price text-sm text-slate-400 line-through">${originalPrice}</span>` : ''}
        ${savings ? `<span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">${savings}</span>` : ''}
      </div>
    </div>
    <div class="flex flex-col items-start sm:items-end gap-2 shrink-0">
      ${couponCode ? `<div class="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs shadow-xs">
        <span class="text-slate-500 font-medium">Promo Code:</span>
        <span class="deal-code font-mono font-black text-red-600 tracking-wider">${couponCode}</span>
      </div>` : ''}
      <a href="${buttonUrl}" target="_blank" rel="noopener noreferrer nofollow sponsored" class="deal-button inline-flex items-center gap-2 bg-[#C62828] hover:bg-[#B71C1C] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow transition">
        ${buttonText}
      </a>
    </div>
  </div>
</div>`;
    }

    case 'pros-cons-grid': {
      const title = params.title || 'Pros & Cons Breakdown';
      const prosList = (params.pros || '')
        .split('\n')
        .map((p) => p.trim())
        .filter(Boolean);
      const consList = (params.cons || '')
        .split('\n')
        .map((c) => c.trim())
        .filter(Boolean);

      return `<div class="editorial-box my-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs article-component relative" data-box-type="pros-cons">
  <div contenteditable="false" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; user-select: none;">
    <h3 class="text-base font-black text-slate-900 flex items-center gap-2" style="margin: 0;">
      <span class="text-[#C62828]">⚖️</span> ${title}
    </h3>
    <button type="button" class="box-delete-btn" style="background: #ffffff; color: #dc2626; border: 1px solid #fecaca; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; cursor: pointer;">
      🗑️ Delete Grid
    </button>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-2">
      <h4 class="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
        <span>✓</span> KEY STRENGTHS (PROS)
      </h4>
      <ul class="text-xs text-slate-700 space-y-1.5 list-disc pl-4 leading-relaxed">
        ${prosList.map((item) => `<li>${item}</li>`).join('\n        ')}
      </ul>
    </div>
    <div class="bg-rose-50/60 border border-rose-200 rounded-xl p-4 space-y-2">
      <h4 class="text-xs font-black uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
        <span>✕</span> THINGS TO CONSIDER (CONS)
      </h4>
      <ul class="text-xs text-slate-700 space-y-1.5 list-disc pl-4 leading-relaxed">
        ${consList.map((item) => `<li>${item}</li>`).join('\n        ')}
      </ul>
    </div>
  </div>
</div>`;
    }

    case 'verdict-dark-box': {
      const badge = params.badge || "Editor's Choice";
      const title = params.title || 'EDITORIAL VERDICT';
      const score = params.score || '9.6 / 10';
      const scoreDesc = params.scoreDesc || 'Rated by our hardware testing team and verified buyer community.';
      const conclusion = params.conclusion || '';

      return `<section class="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md space-y-4 article-component my-6 relative" style="background-color: #0f172a; color: #ffffff;">
  <div contenteditable="false" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 8px; margin-bottom: 8px; user-select: none;">
    <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; display: flex; align-items: center; gap: 6px;">
      <span style="width: 6px; height: 6px; border-radius: 9999px; background-color: #f59e0b;"></span>
      Editorial Verdict Card
    </span>
    <button type="button" class="box-delete-btn" style="background: #1e293b; color: #f87171; border: 1px solid #334155; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; cursor: pointer;">
      🗑️ Delete Card
    </button>
  </div>
  <div class="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
    <h3 class="text-lg font-black tracking-tight text-white flex items-center gap-2">
      <span>🏆</span> ${title}
    </h3>
    <span class="text-xs font-bold bg-[#C62828] text-white px-3 py-1 rounded-full">${badge}</span>
  </div>
  ${conclusion ? `<p class="text-slate-300 text-sm leading-relaxed">${conclusion}</p>` : ''}
  <div class="flex items-center gap-4 pt-2">
    <div class="text-3xl sm:text-4xl font-black text-amber-400">${score}</div>
    ${scoreDesc ? `<div class="text-xs text-slate-400">${scoreDesc}</div>` : ''}
  </div>
</section>`;
    }

    case 'full-media-figure': {
      const imageUrl = params.imageUrl || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&auto=format&fit=crop&q=80';
      const caption = params.caption || 'Hands-on product sample';

      return `<figure class="my-6 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 article-component relative" data-box-type="image">
  <div contenteditable="false" style="position: absolute; top: 10px; right: 10px; z-index: 10; user-select: none;">
    <button type="button" class="box-delete-btn" style="background: rgba(0,0,0,0.75); color: #ffffff; border: 1px solid rgba(255,255,255,0.2); font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 6px; cursor: pointer; backdrop-filter: blur(4px);">
      🗑️ Delete Image
    </button>
  </div>
  <img src="${imageUrl}" alt="${caption}" class="w-full h-auto object-cover max-h-[460px]" />
  ${caption ? `<figcaption class="p-3 text-center text-xs text-slate-500 italic border-t border-slate-100 bg-white">
    ${caption}
  </figcaption>` : ''}
</figure>`;
    }

    case 'split-media-text': {
      const tag = params.tag || 'Design & Craftsmanship';
      const title = params.title || 'Precision Engineering Down to Every Detail';
      const desc = params.desc || '';
      const imageUrl = params.imageUrl || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80';

      return `<section class="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs article-component my-6 relative">
  <div contenteditable="false" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(0,0,0,0.06); padding-bottom: 8px; margin-bottom: 12px; user-select: none;">
    <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; display: flex; align-items: center; gap: 6px;">
      <span style="width: 6px; height: 6px; border-radius: 9999px; background-color: #C62828;"></span>
      2-Column Media Split
    </span>
    <button type="button" class="box-delete-btn" style="background: #ffffff; color: #dc2626; border: 1px solid #fecaca; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; cursor: pointer;">
      🗑️ Delete Card
    </button>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
    <div class="rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
      <img src="${imageUrl}" alt="${title}" class="w-full h-auto object-cover" />
    </div>
    <div class="space-y-3">
      <span class="text-xs font-bold uppercase tracking-wider text-[#C62828]">${tag}</span>
      <h3 class="text-xl font-black text-slate-950">${title}</h3>
      ${desc ? `<p class="text-xs sm:text-sm text-slate-600 leading-relaxed">${desc}</p>` : ''}
    </div>
  </div>
</section>`;
    }

    case 'cta-action-banner': {
      const title = params.title || 'Ready to Experience It Yourself?';
      const desc = params.desc || '';
      const buttonText = params.buttonText || 'Shop Now at Special Price →';
      const buttonUrl = params.buttonUrl || 'https://example.com/buy';

      return `<div class="editorial-box my-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-6 sm:p-7 shadow-lg article-component relative" data-box-type="banner">
  <div contenteditable="false" style="display: flex; align-items: center; justify-content: flex-end; margin-bottom: 8px; user-select: none;">
    <button type="button" class="box-delete-btn" style="background: rgba(255,255,255,0.1); color: #f87171; border: 1px solid rgba(255,255,255,0.15); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; cursor: pointer;">
      🗑️ Delete Banner
    </button>
  </div>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
    <div class="space-y-1 text-center sm:text-left">
      <h3 class="text-base sm:text-lg font-black text-white">${title}</h3>
      ${desc ? `<p class="text-xs text-slate-300">${desc}</p>` : ''}
    </div>
    <a href="${buttonUrl}" target="_blank" rel="noopener noreferrer nofollow sponsored" class="cta-button shrink-0 inline-flex items-center gap-2 bg-[#C62828] hover:bg-[#B71C1C] text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md transition">
      ${buttonText}
    </a>
  </div>
</div>`;
    }

    default:
      return '';
  }
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write or paste your article review content here... Use the toolbar above for headings, images, quotes, and product test tables.',
  minHeight = '360px',
  initialPaperView = false,
}: RichTextEditorProps) {
  const toastCtx = useOptionalToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceCode, setSourceCode] = useState(value);
  
  // Modals state
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkTargetBlank, setLinkTargetBlank] = useState(true);
  const [linkSponsored, setLinkSponsored] = useState(true);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageAlign, setImageAlign] = useState<'center' | 'full' | 'left' | 'right'>('center');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageTags, setImageTags] = useState<string[]>(['article', 'illustration']);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  // Deal Box modal state
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [editingBoxEl, setEditingBoxEl] = useState<HTMLElement | null>(null);
  const [dealForm, setDealForm] = useState({
    title: 'Nilight 20-Inch Curved Dual-Row LED Light Bar',
    originalPrice: '$89.99',
    dealPrice: '$49.99',
    couponCode: 'HEYGOODLY20',
    badge: 'Verified Exclusive Deal',
    description: 'Use code HEYGOODLY20 at checkout for an extra 20% off.',
    buttonText: 'Claim Deal at Official Store →',
    buttonUrl: 'https://www.nilight.com/?ref=heygoodly',
    buttonStyle: 'crimson' as 'crimson' | 'emerald' | 'dark',
  });

  // Standalone Button CTA modal state
  const [buttonModalOpen, setButtonModalOpen] = useState(false);
  const [buttonForm, setButtonForm] = useState({
    text: 'Check Verified Price on Merchant Store →',
    url: 'https://',
    style: 'crimson' as 'crimson' | 'dark' | 'emerald' | 'outline',
    alignment: 'center' as 'left' | 'center',
  });

  // Style popover state
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [highlightMenuOpen, setHighlightMenuOpen] = useState(false);
  const [stats, setStats] = useState({ words: 0, characters: 0, readTime: '1 min' });

  // Active component & template states
  const [activeComp, setActiveComp] = useState<HTMLElement | null>(null);
  const [activeCompRect, setActiveCompRect] = useState<{ top: number; right: number; width: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [addCompModalOpen, setAddCompModalOpen] = useState(false);
  const [presetBoxesOpen, setPresetBoxesOpen] = useState(false);
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [templateCategory, setTemplateCategory] = useState('all');
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedTemplateForParams, setSelectedTemplateForParams] = useState<ComponentTemplate | null>(null);
  const [templateParams, setTemplateParams] = useState<Record<string, string>>({});
  const [templatePreviewDevice, setTemplatePreviewDevice] = useState<'desktop' | 'mobile' | 'full'>('desktop');
  const [fullPreviewOpen, setFullPreviewOpen] = useState(false);
  const [fullPreviewDevice, setFullPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Word Ribbon & Canvas View states
  const [ribbonTab, setRibbonTab] = useState<'home' | 'insert' | 'affiliate' | 'view'>('home');
  const [isPaperView, setIsPaperView] = useState(initialPaperView);
  const [currentFont, setCurrentFont] = useState('Inter, system-ui, sans-serif');
  const [currentSize, setCurrentSize] = useState('15px');
  const [fontFamilyMenuOpen, setFontFamilyMenuOpen] = useState(false);
  const [fontSizeMenuOpen, setFontSizeMenuOpen] = useState(false);
  const savedRangeRef = useRef<Range | null>(null);
  const lastHighlightRangeRef = useRef<Range | null>(null);
  const canvasScrollRef = useRef<HTMLDivElement | null>(null);
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [lineSpacingMenuOpen, setLineSpacingMenuOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Sync current selection inside editor and preserve non-collapsed text highlights
  const captureEditorSelection = (clearHighlightIfCollapsed = false) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editorRef.current) return;
    const range = sel.getRangeAt(0);
    if (!editorRef.current.contains(range.startContainer)) return;

    savedRangeRef.current = range.cloneRange();
    if (!range.collapsed && range.toString().length > 0) {
      lastHighlightRangeRef.current = range.cloneRange();
      const anchorEl =
        range.startContainer.nodeType === Node.TEXT_NODE
          ? range.startContainer.parentElement
          : (range.startContainer as HTMLElement);
      if (anchorEl && editorRef.current.contains(anchorEl)) {
        const computed = window.getComputedStyle(anchorEl);
        if (computed.fontSize) {
          const px = `${Math.round(parseFloat(computed.fontSize))}px`;
          if (FONT_SIZES_WORD.includes(px)) {
            setCurrentSize(px);
          }
        }
      }
    } else if (clearHighlightIfCollapsed) {
      lastHighlightRangeRef.current = null;
    }
  };

  // Resolve the active non-collapsed highlight range inside the editor
  const getActiveHighlightRange = (): Range | null => {
    const sel = window.getSelection();
    if (
      sel &&
      sel.rangeCount > 0 &&
      !sel.isCollapsed &&
      editorRef.current &&
      editorRef.current.contains(sel.anchorNode)
    ) {
      const r = sel.getRangeAt(0);
      if (r.toString().length > 0) {
        return r;
      }
    }
    if (
      lastHighlightRangeRef.current &&
      !lastHighlightRangeRef.current.collapsed &&
      editorRef.current &&
      editorRef.current.contains(lastHighlightRangeRef.current.startContainer)
    ) {
      return lastHighlightRangeRef.current;
    }
    if (
      savedRangeRef.current &&
      !savedRangeRef.current.collapsed &&
      editorRef.current &&
      editorRef.current.contains(savedRangeRef.current.startContainer)
    ) {
      return savedRangeRef.current;
    }
    return null;
  };

  // Strict helper to find enclosing component ONLY within editorRef.current
  const findEnclosingComponent = (node: Node | null): HTMLElement | null => {
    if (!node || !editorRef.current) return null;
    const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement);
    if (!el || !editorRef.current.contains(el) || el === editorRef.current) return null;

    let curr: HTMLElement | null = el;
    while (curr && curr !== editorRef.current) {
      if (
        curr.classList.contains('article-component') ||
        curr.classList.contains('editorial-box') ||
        curr.hasAttribute('data-box-type') ||
        curr.tagName.toLowerCase() === 'figure' ||
        curr.tagName.toLowerCase() === 'section'
      ) {
        return curr;
      }
      curr = curr.parentElement;
    }
    return null;
  };

  // Safe component selector with visual highlight ring in the editing space
  const selectComponent = (comp: HTMLElement | null) => {
    if (!comp || !editorRef.current || !editorRef.current.contains(comp) || comp === editorRef.current) {
      if (activeComp) {
        activeComp.classList.remove('ring-2', 'ring-indigo-500', 'ring-offset-2');
      }
      setActiveComp(null);
      return;
    }
    if (activeComp && activeComp !== comp) {
      activeComp.classList.remove('ring-2', 'ring-indigo-500', 'ring-offset-2');
    }
    comp.classList.add('ring-2', 'ring-indigo-500', 'ring-offset-2');
    setActiveComp(comp);
  };

  // Calculate active component position for floating toolbar
  const syncActiveCompRect = (comp: HTMLElement | null = activeComp) => {
    if (!comp || !editorRef.current) {
      setActiveCompRect(null);
      return;
    }
    const editorWrapper = canvasScrollRef.current || editorRef.current.parentElement;
    if (!editorWrapper) return;
    const wrapperRect = editorWrapper.getBoundingClientRect();
    const compRect = comp.getBoundingClientRect();
    const top = compRect.top - wrapperRect.top + editorWrapper.scrollTop;
    const right = wrapperRect.right - compRect.right + 16;
    setActiveCompRect({ top, right: Math.max(16, right), width: compRect.width });
  };

  useEffect(() => {
    if (!activeComp) {
      setActiveCompRect(null);
      return;
    }
    const update = () => syncActiveCompRect(activeComp);
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [activeComp]);

  // Sync incoming value to editor content if not focused
  useEffect(() => {
    if (editorRef.current && !isSourceMode) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setSourceCode(value || '');
    updateStats(value || '');
  }, [value, isSourceMode]);

  // Listen for selection changes and document clicks to dismiss open menus
  useEffect(() => {
    const handleSelectionChange = () => {
      captureEditorSelection(false);
    };
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.font-family-dropdown-container')) {
        setFontFamilyMenuOpen(false);
      }
      if (!target.closest('.font-size-dropdown-container')) {
        setFontSizeMenuOpen(false);
      }
      if (!target.closest('.color-menu-container')) {
        setColorMenuOpen(false);
      }
      if (!target.closest('.highlight-menu-container')) {
        setHighlightMenuOpen(false);
      }
      if (!target.closest('.line-spacing-container')) {
        setLineSpacingMenuOpen(false);
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const updateStats = (html: string) => {
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = text ? text.split(' ').length : 0;
    const characters = text.length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    setStats({
      words,
      characters,
      readTime: `${minutes} min read`,
    });
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      setSourceCode(html);
      updateStats(html);
    }
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const html = e.target.value;
    setSourceCode(html);
    onChange(html);
    updateStats(html);
  };

  const exec = (command: string, val: string | undefined = undefined) => {
    if (isSourceMode) return;
    const sel = window.getSelection();
    const highlightRange = getActiveHighlightRange();
    const restoreRange = highlightRange || savedRangeRef.current;

    if (sel && restoreRange && editorRef.current?.contains(restoreRange.startContainer)) {
      sel.removeAllRanges();
      sel.addRange(restoreRange);
    }

    // If user clicks Clear Formatting (removeFormat) on a highlighted word, also strip custom inline span styles
    if (command === 'removeFormat' && highlightRange && !highlightRange.collapsed) {
      const ancestor =
        highlightRange.commonAncestorContainer.nodeType === Node.TEXT_NODE
          ? highlightRange.commonAncestorContainer.parentElement
          : (highlightRange.commonAncestorContainer as HTMLElement);
      const inlineSpan = ancestor?.closest('span[data-inline-styled="true"]') as HTMLElement | null;
      if (inlineSpan && editorRef.current?.contains(inlineSpan)) {
        inlineSpan.removeAttribute('style');
        inlineSpan.removeAttribute('data-custom-color');
        inlineSpan.removeAttribute('data-custom-highlight');
      }
    }

    document.execCommand(command, false, val);

    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      const newRange = sel.getRangeAt(0).cloneRange();
      savedRangeRef.current = newRange;
      if (!newRange.collapsed) {
        lastHighlightRangeRef.current = newRange.cloneRange();
      }
    }
    if (editorRef.current) {
      editorRef.current.focus({ preventScroll: true });
      handleInput();
    }
  };

  const applyFormatBlock = (tag: string) => {
    const highlightRange = getActiveHighlightRange();
    // If the user highlighted specific word(s), apply the style ONLY to the highlighted selection
    if (highlightRange && !highlightRange.collapsed && highlightRange.toString().trim().length > 0) {
      const normalized = tag.toLowerCase();
      if (normalized === '<p>' || normalized === 'p') {
        applyInlineStylesToSelection({
          fontSize: '15px',
          fontWeight: '400',
          fontStyle: 'normal',
          lineHeight: '1.6',
          backgroundColor: 'transparent',
          borderLeft: 'none',
          padding: '0',
          borderRadius: '0',
        });
        setCurrentSize('15px');
        return;
      }
      if (normalized === '<h2>' || normalized === 'h2') {
        applyInlineStylesToSelection({
          fontSize: '24px',
          fontWeight: '800',
          lineHeight: '1.25',
        });
        setCurrentSize('24px');
        return;
      }
      if (normalized === '<h3>' || normalized === 'h3') {
        applyInlineStylesToSelection({
          fontSize: '20px',
          fontWeight: '700',
          lineHeight: '1.3',
        });
        setCurrentSize('20px');
        return;
      }
      if (normalized === '<blockquote>' || normalized === 'blockquote') {
        applyInlineStylesToSelection({
          fontStyle: 'italic',
          backgroundColor: 'rgba(43, 87, 154, 0.14)',
          borderLeft: '3px solid #2b579a',
          padding: '2px 8px',
          borderRadius: '4px',
        });
        return;
      }
    }
    exec('formatBlock', tag);
  };

  const insertCustomHTML = (html: string) => {
    if (isSourceMode) {
      setSourceCode((prev) => prev + html);
      onChange(sourceCode + html);
      return;
    }

    if (!editorRef.current) return;

    // 1. If an active component is currently selected, insert immediately after it
    if (activeComp && editorRef.current.contains(activeComp)) {
      const temp = document.createElement('div');
      temp.innerHTML = html.trim();
      const newEl = temp.firstElementChild as HTMLElement | null;
      if (newEl) {
        activeComp.after(newEl);
        selectComponent(newEl);
        handleInput();
        newEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
      }
    }

    // 2. Try inserting at cursor / range
    let range: Range | null = null;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current.contains(sel.anchorNode)) {
      range = sel.getRangeAt(0);
    } else if (savedRangeRef.current && editorRef.current.contains(savedRangeRef.current.startContainer)) {
      range = savedRangeRef.current;
    }

    if (range) {
      try {
        range.deleteContents();
        const temp = document.createElement('div');
        temp.innerHTML = html.trim();
        const fragment = document.createDocumentFragment();
        let lastNode: Node | null = null;
        while (temp.firstChild) {
          lastNode = temp.firstChild;
          fragment.appendChild(lastNode);
        }
        range.insertNode(fragment);

        if (lastNode && sel) {
          const newRange = document.createRange();
          newRange.setStartAfter(lastNode);
          newRange.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newRange);
          savedRangeRef.current = newRange.cloneRange();
        }

        if (lastNode instanceof HTMLElement) {
          const comp = findEnclosingComponent(lastNode);
          if (comp) selectComponent(comp);
        }

        editorRef.current.focus();
        handleInput();
        return;
      } catch (err) {
        console.warn('Direct DOM insertion failed, falling back', err);
      }
    }

    // 3. Fallback: Append directly to the end of the editor
    const temp = document.createElement('div');
    temp.innerHTML = html.trim();
    let firstAddedEl: HTMLElement | null = null;
    while (temp.firstChild) {
      const child = temp.firstChild;
      if (!firstAddedEl && child instanceof HTMLElement) {
        firstAddedEl = child;
      }
      editorRef.current.appendChild(child);
    }

    // Append trailing paragraph for smooth continued typing
    const p = document.createElement('p');
    p.innerHTML = '<br/>';
    editorRef.current.appendChild(p);

    if (firstAddedEl) {
      const comp = findEnclosingComponent(firstAddedEl);
      if (comp) selectComponent(comp);
      firstAddedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    editorRef.current.focus();
    handleInput();
  };

  // Helper to get friendly component name (strictly inside editor, never matches outer form)
  const getComponentLabel = (el: HTMLElement | null): string => {
    if (!el || !editorRef.current || !editorRef.current.contains(el) || el === editorRef.current) return '';
    const textTitle = el.querySelector('h2, h3, h4')?.textContent?.trim();
    if (textTitle && !textTitle.toLowerCase().includes('article body content')) {
      return textTitle.slice(0, 42);
    }
    const boxType = el.getAttribute('data-box-type');
    if (boxType) {
      if (boxType === 'deal') return 'Promo Deal Box';
      if (boxType === 'tip') return 'Testing Tip Box';
      if (boxType === 'warning') return 'Warning Callout Box';
      if (boxType === 'verdict') return 'Editorial Verdict Box';
      if (boxType === 'pros-cons') return 'Pros & Cons Grid';
      if (boxType === 'button') return 'CTA Checkout Button';
      if (boxType === 'image') return 'Image Figure';
    }
    if (el.tagName.toLowerCase() === 'figure') return 'Image Figure';
    if (el.tagName.toLowerCase() === 'section') return 'Article Section Card';
    return 'Article Block / Component';
  };

  // Move active component up in DOM
  const moveComponentUp = () => {
    if (!activeComp || !editorRef.current || !editorRef.current.contains(activeComp)) return;
    const prev = activeComp.previousElementSibling;
    if (prev) {
      editorRef.current.insertBefore(activeComp, prev);
      handleInput();
      activeComp.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      syncActiveCompRect(activeComp);
    }
  };

  // Move active component down in DOM
  const moveComponentDown = () => {
    if (!activeComp || !editorRef.current || !editorRef.current.contains(activeComp)) return;
    const next = activeComp.nextElementSibling;
    if (next) {
      editorRef.current.insertBefore(next, activeComp);
      handleInput();
      activeComp.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      syncActiveCompRect(activeComp);
    }
  };

  // Duplicate active component
  const cloneComponent = () => {
    if (!activeComp || !editorRef.current || !editorRef.current.contains(activeComp)) return;
    const clone = activeComp.cloneNode(true) as HTMLElement;
    clone.classList.remove('ring-2', 'ring-indigo-500', 'ring-offset-2');
    activeComp.after(clone);
    selectComponent(clone);
    handleInput();
    clone.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // Switch style on active component
  const applyComponentStyle = (style: 'white' | 'deal' | 'dark' | 'emerald' | 'amber' | 'minimal') => {
    if (!activeComp || !editorRef.current || !editorRef.current.contains(activeComp)) return;
    const baseClasses = 'rounded-2xl p-6 sm:p-8 space-y-4 article-component my-6 transition-all';
    if (style === 'white') {
      activeComp.className = `bg-white border border-slate-200/80 shadow-xs ${baseClasses}`;
      activeComp.style.backgroundColor = '';
      activeComp.style.color = '';
      activeComp.querySelectorAll('h2, h3, h4').forEach((h) => {
        h.classList.remove('text-white');
        h.classList.add('text-slate-950');
      });
      activeComp.querySelectorAll('p').forEach((p) => {
        p.classList.remove('text-slate-300');
        p.classList.add('text-slate-600');
      });
    } else if (style === 'deal') {
      activeComp.className = `bg-gradient-to-br from-red-50 via-white to-orange-50 border-2 border-dashed border-red-700 shadow-xs ${baseClasses}`;
      activeComp.style.backgroundColor = '';
      activeComp.style.color = '';
      activeComp.querySelectorAll('h2, h3, h4').forEach((h) => {
        h.classList.remove('text-white');
        h.classList.add('text-slate-950');
      });
      activeComp.querySelectorAll('p').forEach((p) => {
        p.classList.remove('text-slate-300');
        p.classList.add('text-slate-600');
      });
    } else if (style === 'dark') {
      activeComp.className = `bg-slate-900 text-white shadow-md ${baseClasses}`;
      activeComp.style.backgroundColor = '#0f172a';
      activeComp.style.color = '#ffffff';
      activeComp.querySelectorAll('h2, h3, h4').forEach((h) => {
        h.classList.remove('text-slate-950');
        h.classList.add('text-white');
      });
      activeComp.querySelectorAll('p').forEach((p) => {
        p.classList.remove('text-slate-600');
        p.classList.add('text-slate-300');
      });
    } else if (style === 'emerald') {
      activeComp.className = `bg-emerald-50/70 border border-emerald-200 text-emerald-950 shadow-xs ${baseClasses}`;
      activeComp.style.backgroundColor = '';
      activeComp.style.color = '';
      activeComp.querySelectorAll('h2, h3, h4').forEach((h) => {
        h.classList.remove('text-white');
        h.classList.add('text-emerald-950');
      });
    } else if (style === 'amber') {
      activeComp.className = `bg-amber-50/70 border border-amber-200 text-amber-950 shadow-xs ${baseClasses}`;
      activeComp.style.backgroundColor = '';
      activeComp.style.color = '';
      activeComp.querySelectorAll('h2, h3, h4').forEach((h) => {
        h.classList.remove('text-white');
        h.classList.add('text-amber-950');
      });
    } else if (style === 'minimal') {
      activeComp.className = `p-4 sm:p-6 border-b border-slate-200 space-y-3 article-component my-4`;
      activeComp.style.backgroundColor = '';
      activeComp.style.color = '';
    }
    setStyleDropdownOpen(false);
    handleInput();
  };

  // Insert template component into document
  const insertTemplate = (templateHTML: string) => {
    insertCustomHTML(templateHTML);
    setAddCompModalOpen(false);
  };

  // 1. Delete selected or enclosing box/component (strictly inside editor)
  const deleteActiveBox = () => {
    if (isSourceMode) return;
    let targetComp = activeComp;
    if (!targetComp || !editorRef.current?.contains(targetComp) || targetComp === editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.anchorNode) {
        targetComp = findEnclosingComponent(selection.anchorNode);
      }
    }
    if (!targetComp || !editorRef.current || !editorRef.current.contains(targetComp) || targetComp === editorRef.current) {
      toastCtx?.toast.warning('Please click to select an article card or component inside the editor content to delete.');
      return;
    }
    targetComp.classList.remove('ring-2', 'ring-indigo-500', 'ring-offset-2');
    targetComp.remove();
    setActiveComp(null);
    handleInput();
  };

  // Delegated click handler on editor container for quick delete and edit buttons
  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Handle Delete Box/Component button directly inside card
    const deleteBtn = target.closest('.box-delete-btn, .comp-delete-btn');
    if (deleteBtn) {
      e.preventDefault();
      e.stopPropagation();
      const box = findEnclosingComponent(deleteBtn);
      if (box && editorRef.current && editorRef.current.contains(box) && box !== editorRef.current) {
        box.classList.remove('ring-2', 'ring-indigo-500', 'ring-offset-2');
        box.remove();
        setActiveComp(null);
        handleInput();
      }
      return;
    }

    // Handle Edit Deal / Button Link
    const editBtn = target.closest('.box-edit-deal-btn');
    if (editBtn) {
      e.preventDefault();
      e.stopPropagation();
      const box = findEnclosingComponent(editBtn);
      if (box) {
        setEditingBoxEl(box);
        const titleEl = box.querySelector('.deal-title');
        const priceEl = box.querySelector('.deal-price');
        const origPriceEl = box.querySelector('.deal-original-price');
        const codeEl = box.querySelector('.deal-code');
        const linkEl = box.querySelector('.deal-button') as HTMLAnchorElement;
        
        setDealForm({
          title: titleEl?.textContent || 'Product Deal Title',
          dealPrice: priceEl?.textContent || '$49.99',
          originalPrice: origPriceEl?.textContent || '$89.99',
          couponCode: codeEl?.textContent || 'DISCOUNT20',
          badge: 'Verified Exclusive Deal',
          description: 'Verified promo code tested against live merchant checkout.',
          buttonText: linkEl?.textContent?.trim() || 'Claim Deal at Official Store →',
          buttonUrl: linkEl?.href || 'https://',
          buttonStyle: 'crimson',
        });
        setDealModalOpen(true);
      }
      return;
    }

    // Detect active component strictly inside editorRef.current
    const comp = findEnclosingComponent(target);
    selectComponent(comp);

    // Handle Direct Click on Links to Edit Link
    const linkEl = target.closest('a');
    if (linkEl && !linkEl.classList.contains('deal-button') && !linkEl.classList.contains('cta-button')) {
      if (e.altKey || e.metaKey || e.ctrlKey) {
        e.preventDefault();
        setLinkUrl(linkEl.getAttribute('href') || '');
        setLinkText(linkEl.textContent || '');
        setLinkModalOpen(true);
      }
    }
  };

  // Direct Drag & Drop image files onto editor canvas
  const handleEditorDrop = async (e: React.DragEvent) => {
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        e.stopPropagation();
        setIsUploadingImage(true);
        try {
          const item = await mediaService.uploadMedia(file, 'articles', ['article-content']);
          if (item && item.url) {
            insertImageHTML(item.url, file.name.replace(/\.[^/.]+$/, ''));
            setIsUploadingImage(false);
            return;
          }
        } catch (err) {
          // Fallback to data URL
          const reader = new FileReader();
          reader.onload = (ev) => {
            insertImageHTML(ev.target?.result as string, file.name);
            setIsUploadingImage(false);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  // Helper to insert structured image
  const insertImageHTML = (src: string, caption: string = '', align: string = 'center') => {
    let containerStyle = 'margin: 24px auto; text-align: center; max-width: 100%;';
    if (align === 'left') {
      containerStyle = 'float: left; margin: 12px 24px 16px 0; max-width: 48%;';
    } else if (align === 'right') {
      containerStyle = 'float: right; margin: 12px 0 16px 24px; max-width: 48%;';
    } else if (align === 'full') {
      containerStyle = 'margin: 30px 0; width: 100%; text-align: center;';
    }

    const captionMarkup = caption.trim() 
      ? `<figcaption style="text-align: center; font-size: 12px; color: #71717A; margin-top: 6px; font-style: italic;">${caption}</figcaption>` 
      : '';

    const html = `
      <figure class="editorial-box group/box relative" data-box-type="image" style="${containerStyle}">
        <div contenteditable="false" style="position: absolute; top: 8px; right: 8px; z-index: 10; display: flex; gap: 4px; user-select: none;">
          <button type="button" class="box-delete-btn" style="background: rgba(0,0,0,0.75); color: #ffffff; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; border: none; cursor: pointer; backdrop-filter: blur(4px);">
            ✕ Delete Image
          </button>
        </div>
        <img src="${src}" alt="${caption || 'Article illustration'}" style="width: 100%; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); display: block;" />
        ${captionMarkup}
      </figure>
    `;
    insertCustomHTML(html);
  };

  // Insert Callout Box (with 1-click Delete button)
  const insertCallout = (type: 'tip' | 'warning' | 'verdict') => {
    let calloutHTML = '';
    if (type === 'tip') {
      calloutHTML = `
        <div class="editorial-box relative group/box" data-box-type="tip" style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px 18px; margin: 20px 0; border-radius: 8px; position: relative;">
          <div contenteditable="false" style="display: flex; justify-content: flex-end; margin-bottom: 4px; user-select: none;">
            <button type="button" class="box-delete-btn" style="background: #dcfce7; color: #166534; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bbf7d0; cursor: pointer;">
              ✕ Delete Tip Box
            </button>
          </div>
          <strong style="color: #15803d; display: block; margin-bottom: 4px;">💡 Editor's Testing Tip</strong>
          <p style="margin: 0; color: #166534; font-size: 14px;">Insert your field testing recommendation or secret discount strategy here...</p>
        </div>
      `;
    } else if (type === 'warning') {
      calloutHTML = `
        <div class="editorial-box relative group/box" data-box-type="warning" style="background-color: #fef2f2; border-left: 4px solid #C62828; padding: 16px 18px; margin: 20px 0; border-radius: 8px; position: relative;">
          <div contenteditable="false" style="display: flex; justify-content: flex-end; margin-bottom: 4px; user-select: none;">
            <button type="button" class="box-delete-btn" style="background: #fee2e2; color: #991b1b; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #fecaca; cursor: pointer;">
              ✕ Delete Warning Box
            </button>
          </div>
          <strong style="color: #991b1b; display: block; margin-bottom: 4px;">⚠️ Buyer Beware / Caveat</strong>
          <p style="margin: 0; color: #7f1d1d; font-size: 14px;">Note any critical compatibility issues, warranty caveats, or fake counterfeits to watch out for...</p>
        </div>
      `;
    } else {
      calloutHTML = `
        <div class="editorial-box relative group/box" data-box-type="verdict" style="background-color: #171717; color: #ffffff; padding: 22px 24px; margin: 24px 0; border-radius: 14px; border: 1px solid #333333; position: relative;">
          <div contenteditable="false" style="display: flex; justify-content: flex-end; margin-bottom: 6px; user-select: none;">
            <button type="button" class="box-delete-btn" style="background: #27272a; color: #f43f5e; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #3f3f46; cursor: pointer;">
              ✕ Delete Verdict Box
            </button>
          </div>
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #C62828; font-weight: 700; margin-bottom: 6px;">HeyGoodly Lab Score: 9.4 / 10</div>
          <h4 style="margin: 0 0 8px 0; color: #ffffff; font-size: 18px; font-weight: 700;">The Editorial Verdict</h4>
          <p style="margin: 0; color: #a1a1aa; font-size: 14px; line-height: 1.6;">Our final testing conclusion after 30 days of real-world use. Highly recommended for enthusiasts seeking durable build quality.</p>
        </div>
      `;
    }
    insertCustomHTML(calloutHTML);
  };

  // Insert Pros & Cons Box
  const insertProsCons = () => {
    const prosConsHTML = `
      <div class="editorial-box my-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs relative" data-box-type="pros-cons">
        <div contenteditable="false" style="grid-column: 1 / -1; display: flex; justify-content: flex-end; user-select: none;">
          <button type="button" class="box-delete-btn" style="background: #f1f5f9; color: #dc2626; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #e2e8f0; cursor: pointer;">
            ✕ Delete Pros/Cons Grid
          </button>
        </div>
        <div style="background: #f0fdf4; border-radius: 12px; padding: 16px; border: 1px solid #bbf7d0;">
          <strong style="color: #166534; font-size: 14px; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
            ✓ Key Strengths (Pros)
          </strong>
          <ul style="margin: 0; padding-left: 20px; color: #15803d; font-size: 13px; line-height: 1.6;">
            <li>Premium build finish with a solid, ergonomic hand feel.</li>
            <li>Outstanding brightness and performance in its price bracket.</li>
            <li>Backed by an official manufacturer warranty and fast returns.</li>
          </ul>
        </div>
        <div style="background: #fef2f2; border-radius: 12px; padding: 16px; border: 1px solid #fecaca;">
          <strong style="color: #991b1b; font-size: 14px; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
            ✕ Things to Consider (Cons)
          </strong>
          <ul style="margin: 0; padding-left: 20px; color: #7f1d1d; font-size: 13px; line-height: 1.6;">
            <li>Slightly higher retail price than budget competitors.</li>
            <li>Optional expansion accessories are sold separately.</li>
          </ul>
        </div>
      </div>
    `;
    insertCustomHTML(prosConsHTML);
  };

  // Save Deal Box (Create new or update existing)
  const handleSaveDealBox = () => {
    if (!dealForm.title?.trim()) {
      toastCtx?.toast.error('Product Name / Deal Title is required');
      return;
    }
    if (!dealForm.buttonUrl?.trim()) {
      toastCtx?.toast.error('Button Destination Link is required');
      return;
    }
    let btnBg = '#C62828';
    if (dealForm.buttonStyle === 'emerald') btnBg = '#059669';
    if (dealForm.buttonStyle === 'dark') btnBg = '#171717';

    const finalBoxHTML = `
      <div class="editorial-box my-6 border-2 border-[#C62828] bg-white rounded-2xl p-6 shadow-sm relative" data-box-type="deal" style="border: 2px solid #C62828; background-color: #ffffff; padding: 22px; border-radius: 16px; margin: 24px 0;">
        <div contenteditable="false" style="display: flex; justify-content: flex-end; gap: 6px; margin-bottom: 12px; user-select: none;">
          <button type="button" class="box-edit-deal-btn" style="background: #f1f5f9; color: #334155; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 6px; border: 1px solid #cbd5e1; cursor: pointer;">
            ✏️ Edit Button Link & Price
          </button>
          <button type="button" class="box-delete-btn" style="background: #fef2f2; color: #dc2626; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 6px; border: 1px solid #fecaca; cursor: pointer;">
            ✕ Delete Deal Box
          </button>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="background-color: #fef2f2; color: #C62828; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase;">${dealForm.badge}</span>
          <span style="font-size: 20px; font-weight: 800; color: #171717;">
            <span class="deal-price">${dealForm.dealPrice}</span>
            <span class="deal-original-price" style="font-size: 13px; text-decoration: line-through; color: #737373; margin-left: 6px;">${dealForm.originalPrice}</span>
          </span>
        </div>
        <h4 class="deal-title" style="margin: 0 0 6px 0; font-size: 18px; font-weight: 700; color: #171717;">${dealForm.title}</h4>
        <p style="margin: 0 0 16px 0; font-size: 13px; color: #52525b;">${dealForm.description} Promo code: <strong class="deal-code" style="color: #C62828; background: #fef2f2; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${dealForm.couponCode}</strong></p>
        <a href="${dealForm.buttonUrl}" target="_blank" rel="noopener noreferrer" class="deal-button" style="display: inline-block; background-color: ${btnBg}; color: #ffffff; font-weight: 700; font-size: 13px; padding: 11px 24px; border-radius: 8px; text-decoration: none;">
          ${dealForm.buttonText}
        </a>
      </div>
    `;

    if (editingBoxEl) {
      editingBoxEl.outerHTML = finalBoxHTML;
      setEditingBoxEl(null);
      handleInput();
    } else {
      insertCustomHTML(finalBoxHTML);
    }
    setDealModalOpen(false);
  };

  // Insert Standalone Button CTA
  const handleInsertButton = () => {
    if (!buttonForm.text?.trim()) {
      toastCtx?.toast.error('Button Label is required');
      return;
    }
    if (!buttonForm.url?.trim()) {
      toastCtx?.toast.error('Destination URL is required');
      return;
    }
    let btnStyle = 'background-color: #C62828; color: #ffffff; border: none;';
    if (buttonForm.style === 'emerald') btnStyle = 'background-color: #059669; color: #ffffff; border: none;';
    if (buttonForm.style === 'dark') btnStyle = 'background-color: #171717; color: #ffffff; border: none;';
    if (buttonForm.style === 'outline') btnStyle = 'background-color: transparent; color: #C62828; border: 2px solid #C62828;';

    const alignStyle = buttonForm.alignment === 'center' ? 'text-align: center; margin: 20px auto;' : 'text-align: left; margin: 20px 0;';

    const btnHTML = `
      <div class="editorial-box my-4" data-box-type="button" style="${alignStyle}">
        <div contenteditable="false" style="display: inline-block; margin-bottom: 4px; user-select: none;">
          <button type="button" class="box-delete-btn" style="background: #f1f5f9; color: #dc2626; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1; cursor: pointer; margin-right: 6px;">
            ✕ Delete Button
          </button>
        </div>
        <a href="${buttonForm.url}" target="_blank" rel="noopener noreferrer" class="cta-button" style="display: inline-block; ${btnStyle} font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 10px; text-decoration: none; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          ${buttonForm.text}
        </a>
      </div>
    `;
    insertCustomHTML(btnHTML);
    setButtonModalOpen(false);
  };

  // Open Link Modal with pre-filled highlighted text
  const openLinkModal = () => {
    let text = '';
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed && editorRef.current?.contains(sel.anchorNode)) {
      text = sel.toString().trim();
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    } else if (
      savedRangeRef.current &&
      !savedRangeRef.current.collapsed &&
      editorRef.current?.contains(savedRangeRef.current.startContainer)
    ) {
      text = savedRangeRef.current.toString().trim();
    }

    setLinkText(text);
    setLinkUrl('');
    setLinkTargetBlank(true);
    setLinkSponsored(true);
    setLinkModalOpen(true);
  };

  // Insert Link
  const handleInsertLink = () => {
    if (!linkUrl.trim()) return;
    const finalUrl =
      linkUrl.startsWith('http://') ||
      linkUrl.startsWith('https://') ||
      linkUrl.startsWith('mailto:') ||
      linkUrl.startsWith('tel:')
        ? linkUrl
        : `https://${linkUrl}`;

    const targetAttr = linkTargetBlank ? ' target="_blank"' : '';
    const relAttr = linkSponsored
      ? ' rel="nofollow sponsored noopener noreferrer"'
      : linkTargetBlank
      ? ' rel="noopener noreferrer"'
      : '';

    const display = linkText.trim() || finalUrl;
    const linkHTML = `<a href="${finalUrl}"${targetAttr}${relAttr} style="color: #2b579a; text-decoration: underline; font-weight: 600;">${display}</a>`;

    insertCustomHTML(linkHTML);
    setLinkUrl('');
    setLinkText('');
    setLinkModalOpen(false);
  };

  // Upload image file from modal
  const handleModalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      setIsUploadingImage(true);
      setUploadProgress(25);
      try {
        setUploadProgress(50);
        const data = await mediaService.uploadMedia(file, 'articles', imageTags);
        setUploadProgress(85);
        if (data && data.url) {
          setImageUrl(data.url);
          setIsUploadingImage(false);
          setUploadProgress(100);
          return;
        }
        throw new Error('Upload failed');
      } catch (err) {
        // Fallback to data URL
        const reader = new FileReader();
        reader.onload = (ev) => {
          setImageUrl(ev.target?.result as string);
          setIsUploadingImage(false);
          setUploadProgress(100);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Submit modal image insert
  const handleApplyImageModal = () => {
    if (!imageUrl.trim()) return;
    if (imageTags.length === 0) {
      toastCtx?.toast.warning('Please add at least 1 tag to save and index this image!');
      return;
    }
    insertImageHTML(imageUrl, imageCaption, imageAlign);
    setImageUrl('');
    setImageCaption('');
    setImageTags(['article', 'illustration']);
    setUploadedFileName('');
    setImageModalOpen(false);
  };

  // Helper to apply one or more inline styles strictly to the highlighted text selection
  const applyInlineStylesToSelection = (styles: Record<string, string>) => {
    const sel = window.getSelection();
    const range = getActiveHighlightRange();

    // Only apply to the highlighted selection — NEVER mutate the entire paragraph block or editor root
    if (!range || range.collapsed) {
      return;
    }

    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }

    const selectedText = range.toString();
    if (!selectedText) return;

    const styleKeys = Object.keys(styles);

    // Check if the selection already targets a single inline-styled span with identical text
    const ancestorNode =
      range.commonAncestorContainer.nodeType === Node.TEXT_NODE
        ? range.commonAncestorContainer.parentElement
        : (range.commonAncestorContainer as HTMLElement);
    const existingSpan = ancestorNode?.closest('span[data-inline-styled="true"]') as HTMLElement | null;

    if (
      existingSpan &&
      editorRef.current?.contains(existingSpan) &&
      existingSpan.textContent === selectedText
    ) {
      // Strip conflicting inline styles on child elements inside existingSpan
      existingSpan.querySelectorAll('*').forEach((child) => {
        if (child instanceof HTMLElement) {
          styleKeys.forEach((k) => {
            (child.style as unknown as Record<string, string>)[k] = '';
          });
          if (styles.color && child.tagName.toLowerCase() === 'font') {
            child.removeAttribute('color');
          }
        }
      });

      Object.entries(styles).forEach(([k, v]) => {
        (existingSpan.style as unknown as Record<string, string>)[k] = v;
      });
      if (styles.color) {
        existingSpan.setAttribute('data-custom-color', 'true');
      }
      if (styles.backgroundColor) {
        if (styles.backgroundColor === 'transparent') {
          existingSpan.removeAttribute('data-custom-highlight');
        } else {
          existingSpan.setAttribute('data-custom-highlight', 'true');
        }
      }

      if (sel) {
        const newRange = document.createRange();
        newRange.selectNodeContents(existingSpan);
        sel.removeAllRanges();
        sel.addRange(newRange);
        savedRangeRef.current = newRange.cloneRange();
        lastHighlightRangeRef.current = newRange.cloneRange();
      }
      editorRef.current?.focus({ preventScroll: true });
      handleInput();
      return;
    }

    try {
      const fragment = range.extractContents();
      // Remove conflicting inline styles on nested elements inside extracted fragment
      fragment.querySelectorAll('*').forEach((child) => {
        if (child instanceof HTMLElement) {
          styleKeys.forEach((k) => {
            (child.style as unknown as Record<string, string>)[k] = '';
          });
          if (styles.color && child.tagName.toLowerCase() === 'font') {
            child.removeAttribute('color');
          }
        }
      });

      const span = document.createElement('span');
      span.setAttribute('data-inline-styled', 'true');
      Object.entries(styles).forEach(([k, v]) => {
        (span.style as unknown as Record<string, string>)[k] = v;
      });
      if (styles.fontSize && !styles.lineHeight) {
        span.style.lineHeight = '1.25';
      }
      if (styles.color) {
        span.setAttribute('data-custom-color', 'true');
      }
      if (styles.backgroundColor && styles.backgroundColor !== 'transparent') {
        span.setAttribute('data-custom-highlight', 'true');
      }

      span.appendChild(fragment);
      range.insertNode(span);

      // Re-select newly styled span so user sees it highlighted and can chain styles
      if (sel) {
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        sel.removeAllRanges();
        sel.addRange(newRange);
        savedRangeRef.current = newRange.cloneRange();
        lastHighlightRangeRef.current = newRange.cloneRange();
      }
      editorRef.current?.focus({ preventScroll: true });
      handleInput();
    } catch (err) {
      console.warn('extractContents failed, fallback to insertHTML', err);
      const inlineCss = Object.entries(styles)
        .map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}: ${v}`)
        .join('; ');
      const html = `<span data-inline-styled="true" style="${inlineCss}">${selectedText}</span>`;
      document.execCommand('insertHTML', false, html);
      editorRef.current?.focus({ preventScroll: true });
      handleInput();
    }
  };

  // Single-property convenience wrapper
  const applyInlineStyleToSelection = (
    styleProp: 'fontSize' | 'fontFamily' | 'color' | 'backgroundColor',
    styleValue: string
  ) => {
    applyInlineStylesToSelection({ [styleProp]: styleValue });
  };

  // Typography font size change
  const handleFontSizeChange = (size: string) => {
    setCurrentSize(size);
    applyInlineStyleToSelection('fontSize', size);
  };

  // Typography color change
  const handleColorChange = (color: string) => {
    applyInlineStyleToSelection('color', color);
    setColorMenuOpen(false);
  };

  // Typography highlight change
  const handleHighlightChange = (color: string) => {
    applyInlineStyleToSelection('backgroundColor', color);
    setHighlightMenuOpen(false);
  };

  // Toggle Serif font on selection
  const handleToggleSerif = () => {
    applyInlineStyleToSelection('fontFamily', 'var(--font-serif), Georgia, serif');
  };

  // Word Font Family Change
  const handleFontFamilyChange = (font: string) => {
    setCurrentFont(font);
    applyInlineStyleToSelection('fontFamily', font);
  };

  // Word Step Font Size (A+ / A-)
  const handleStepSize = (direction: 1 | -1) => {
    const currentIndex = FONT_SIZES_WORD.indexOf(currentSize);
    let nextIndex = (currentIndex === -1 ? 5 : currentIndex) + direction;
    if (nextIndex < 0) nextIndex = 0;
    if (nextIndex >= FONT_SIZES_WORD.length) nextIndex = FONT_SIZES_WORD.length - 1;
    const nextSize = FONT_SIZES_WORD[nextIndex];
    handleFontSizeChange(nextSize);
  };

  // Word Line Spacing
  const handleLineSpacing = (spacing: string) => {
    setLineSpacingMenuOpen(false);
    const highlightRange = getActiveHighlightRange();
    if (highlightRange && !highlightRange.collapsed && highlightRange.toString().trim().length > 0) {
      applyInlineStylesToSelection({ lineHeight: spacing });
      return;
    }
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    let parent = range.commonAncestorContainer as HTMLElement;
    if (parent.nodeType === Node.TEXT_NODE) {
      parent = parent.parentElement as HTMLElement;
    }
    const block = (parent.closest('p, h1, h2, h3, h4, li, div') as HTMLElement) || editorRef.current;
    if (block && block !== editorRef.current) {
      block.style.lineHeight = spacing;
      handleInput();
    }
  };

  // Word Insert Table
  const handleInsertTable = (rows: number, cols: number) => {
    let tableHtml = `<div class="article-component my-6 overflow-x-auto"><table class="w-full border-collapse border border-slate-300 rounded-xl overflow-hidden shadow-xs text-sm my-2"><thead><tr class="bg-slate-100 text-slate-900">`;
    for (let c = 1; c <= cols; c++) {
      tableHtml += `<th class="border border-slate-300 px-4 py-2 text-left font-black text-xs uppercase tracking-wider">Column ${c}</th>`;
    }
    tableHtml += `</tr></thead><tbody>`;
    for (let r = 1; r <= rows; r++) {
      const rowBg = r % 2 === 0 ? 'bg-slate-50/60' : 'bg-white';
      tableHtml += `<tr class="${rowBg}">`;
      for (let c = 1; c <= cols; c++) {
        tableHtml += `<td class="border border-slate-300 px-4 py-2.5 text-slate-700">Cell ${r}.${c}</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table></div><p><br></p>`;
    insertCustomHTML(tableHtml);
    setTableModalOpen(false);
  };

  return (
    <div
      onScroll={(e) => {
        if (e.currentTarget.scrollTop !== 0) {
          e.currentTarget.scrollTop = 0;
        }
      }}
      className={
        isFullscreen
          ? 'fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm p-2 sm:p-5 flex flex-col justify-center items-center animate-fadeIn'
          : 'border border-slate-200 rounded-2xl bg-white shadow-2xs flex flex-col w-full'
      }
    >
      <div
        onScroll={(e) => {
          if (e.currentTarget.scrollTop !== 0) {
            e.currentTarget.scrollTop = 0;
          }
        }}
        className={
          isFullscreen
            ? 'w-full h-full max-w-[1600px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden'
            : 'flex flex-col w-full rounded-2xl'
        }
      >
      
      {/* =========================================================================
          PINNED / STICKY WORD HEADER + RIBBON TOOLBAR + ACTIVE BLOCK BAR
         ========================================================================= */}
      <div className="shrink-0 sticky top-0 z-30 flex flex-col rounded-t-2xl">
      {/* =========================================================================
          MICROSOFT WORD TOP BAR (WORD STUDIO BLUE ACCENT)
         ========================================================================= */}
      <div className="bg-[#2b579a] text-white px-3.5 py-2 flex items-center justify-between select-none shadow-xs border-b border-[#204477] rounded-t-2xl">
        {/* Left: Word Logo, Document Title & Auto-Save */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-white text-[#2b579a] font-black text-xs flex items-center justify-center font-serif shadow-xs tracking-tighter">
            W
          </div>
          <span className="font-extrabold text-xs tracking-tight">Article Document • Microsoft Word Studio</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-white/80 bg-white/10 px-2 py-0.5 rounded font-medium ml-1">
            <Check size={11} className="text-emerald-300" /> Auto-Saved
          </span>

          <div className="h-4 w-px bg-white/20 mx-1 hidden sm:block" />

          {/* Quick Undo / Redo */}
          <div className="hidden sm:flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => exec('undo')}
              className="p-1 hover:bg-white/15 rounded text-white/90 hover:text-white transition cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw size={13} />
            </button>
            <button
              type="button"
              onClick={() => exec('redo')}
              className="p-1 hover:bg-white/15 rounded text-white/90 hover:text-white transition cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <RotateCw size={13} />
            </button>
          </div>
        </div>

        {/* Right: View Mode Toggle (A4 vs Full Width), Fullscreen, Code View */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsPaperView(!isPaperView)}
            className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
              isPaperView ? 'bg-white text-[#2b579a]' : 'bg-white/15 text-white hover:bg-white/25'
            }`}
            title={isPaperView ? 'Currently in A4 Page Mode' : 'Switch to A4 Page Mode'}
          >
            <FileText size={13} />
            <span>{isPaperView ? '📄 A4 Page (Word)' : '⛶ Full Width 100%'}</span>
          </button>

          {/* Live Preview Button */}
          <button
            type="button"
            onClick={() => setFullPreviewOpen(true)}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Preview article in real website layout (Desktop, Tablet, Mobile)"
          >
            <Eye size={13} />
            <span className="hidden sm:inline">Live Preview</span>
            <span className="sm:hidden">Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-white/15 rounded text-white transition cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          <button
            type="button"
            onClick={() => setIsSourceMode(!isSourceMode)}
            className={`px-2 py-1 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              isSourceMode ? 'bg-amber-400 text-slate-950 font-black' : 'bg-white/15 text-white hover:bg-white/25'
            }`}
            title="Toggle HTML Source Code Mode"
          >
            {isSourceMode ? <Eye size={13} /> : <Code2 size={13} />}
            <span className="hidden sm:inline">{isSourceMode ? 'Visual' : 'HTML'}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MICROSOFT WORD RIBBON TABS (HOME, INSERT, AFFILIATE, VIEW)
         ========================================================================= */}
      <div className="bg-[#f3f2f1] border-b border-slate-300 px-3 flex items-center gap-1 text-xs select-none pt-1">
        <button
          type="button"
          onClick={() => setRibbonTab('home')}
          className={`px-4 py-1.5 font-bold transition cursor-pointer border-t-2 rounded-t-md text-xs flex items-center gap-1.5 ${
            ribbonTab === 'home'
              ? 'bg-white border-[#2b579a] text-[#2b579a] shadow-xs'
              : 'border-transparent text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
          }`}
        >
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => setRibbonTab('insert')}
          className={`px-4 py-1.5 font-bold transition cursor-pointer border-t-2 rounded-t-md text-xs flex items-center gap-1.5 ${
            ribbonTab === 'insert'
              ? 'bg-white border-[#2b579a] text-[#2b579a] shadow-xs'
              : 'border-transparent text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
          }`}
        >
          <PlusCircle size={12} className={ribbonTab === 'insert' ? 'text-[#2b579a]' : 'text-slate-500'} />
          <span>Insert</span>
        </button>

        <button
          type="button"
          onClick={() => setRibbonTab('affiliate')}
          className={`px-4 py-1.5 font-bold transition cursor-pointer border-t-2 rounded-t-md text-xs flex items-center gap-1.5 ${
            ribbonTab === 'affiliate'
              ? 'bg-white border-[#C62828] text-[#C62828] shadow-xs'
              : 'border-transparent text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
          }`}
        >
          <Tag size={12} className={ribbonTab === 'affiliate' ? 'text-[#C62828]' : 'text-slate-500'} />
          <span>Affiliate Blocks</span>
        </button>

        <button
          type="button"
          onClick={() => setRibbonTab('view')}
          className={`px-4 py-1.5 font-bold transition cursor-pointer border-t-2 rounded-t-md text-xs flex items-center gap-1.5 ${
            ribbonTab === 'view'
              ? 'bg-white border-[#2b579a] text-[#2b579a] shadow-xs'
              : 'border-transparent text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
          }`}
        >
          <Layers size={12} className={ribbonTab === 'view' ? 'text-[#2b579a]' : 'text-slate-500'} />
          <span>Layout &amp; View</span>
        </button>
      </div>

      {/* =========================================================================
          RIBBON BODY CONTENT STRIP (WORD GROUPED TOOLBAR)
         ========================================================================= */}
      <div className="bg-white border-b border-slate-300 px-3 py-2 flex items-stretch gap-3 text-xs text-slate-800 select-none overflow-visible relative z-30 shadow-2xs min-h-[92px]">
        
        {/* ================= TAB 1: HOME (TRANG CHỦ) ================= */}
        {ribbonTab === 'home' && (
          <>
            {/* Nhóm 1: Hoàn tác & Clipboard */}
            <div className="flex flex-col justify-between pr-2 border-r border-slate-200 shrink-0">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec('undo')}
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition cursor-pointer flex items-center gap-1"
                  title="Undo (Ctrl+Z)"
                >
                  <RotateCcw size={14} className="text-[#2b579a]" />
                  <span className="text-[11px] font-semibold">Undo</span>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec('redo')}
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition cursor-pointer flex items-center gap-1"
                  title="Redo (Ctrl+Y)"
                >
                  <RotateCw size={14} className="text-[#2b579a]" />
                  <span className="text-[11px] font-semibold">Redo</span>
                </button>
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center mt-1">
                History
              </div>
            </div>

            {/* Group 2: Font & Typography */}
            <div className="flex flex-col justify-between pr-3 border-r border-slate-200 shrink-0">
              {/* Row 1: Font Family, Font Size, A+, A-, Clear */}
              <div className="flex items-center gap-1.5">
                {/* Font Selector Custom Popover */}
                <div className="font-family-dropdown-container relative">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setFontFamilyMenuOpen(!fontFamilyMenuOpen);
                      setFontSizeMenuOpen(false);
                      setColorMenuOpen(false);
                      setHighlightMenuOpen(false);
                      setLineSpacingMenuOpen(false);
                    }}
                    className="h-7 text-xs bg-slate-50 hover:bg-white hover:border-[#2b579a] border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-semibold focus:outline-none flex items-center justify-between gap-1.5 cursor-pointer shadow-2xs w-44 truncate"
                    title="Select Font Family"
                  >
                    <span className="truncate">{FONT_FAMILIES.find((f) => f.value === currentFont)?.label || currentFont}</span>
                    <ChevronDown size={12} className="text-slate-400 shrink-0" />
                  </button>
                  {fontFamilyMenuOpen && (
                    <div
                      onMouseDown={(e) => e.preventDefault()}
                      className="absolute top-full left-0 mt-1 z-50 bg-white border border-slate-200 rounded-xl py-1 shadow-2xl w-56 max-h-64 overflow-y-auto animate-fadeIn"
                    >
                      {FONT_FAMILIES.map((font) => (
                        <button
                          key={font.value}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            handleFontFamilyChange(font.value);
                            setFontFamilyMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-[#2b579a] transition flex items-center justify-between cursor-pointer ${
                            currentFont === font.value ? 'bg-blue-50 text-[#2b579a] font-bold' : 'text-slate-700'
                          }`}
                          style={{ fontFamily: font.value }}
                        >
                          <span className="truncate">{font.label}</span>
                          {currentFont === font.value && <Check size={12} className="text-[#2b579a] shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Font Size Selector Custom Popover */}
                <div className="font-size-dropdown-container relative">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setFontSizeMenuOpen(!fontSizeMenuOpen);
                      setFontFamilyMenuOpen(false);
                      setColorMenuOpen(false);
                      setHighlightMenuOpen(false);
                      setLineSpacingMenuOpen(false);
                    }}
                    className="h-7 text-xs bg-slate-50 hover:bg-white hover:border-[#2b579a] border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-bold focus:outline-none flex items-center justify-between gap-1 cursor-pointer shadow-2xs w-16"
                    title="Font Size"
                  >
                    <span>{currentSize.replace('px', '')}</span>
                    <ChevronDown size={11} className="text-slate-400 shrink-0" />
                  </button>
                  {fontSizeMenuOpen && (
                    <div
                      onMouseDown={(e) => e.preventDefault()}
                      className="absolute top-full left-0 mt-1 z-50 bg-white border border-slate-200 rounded-xl py-1 shadow-2xl w-24 max-h-64 overflow-y-auto animate-fadeIn"
                    >
                      {FONT_SIZES_WORD.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            handleFontSizeChange(sz);
                            setFontSizeMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-[#2b579a] transition flex items-center justify-between cursor-pointer ${
                            currentSize === sz ? 'bg-blue-50 text-[#2b579a] font-bold' : 'text-slate-700 font-medium'
                          }`}
                        >
                          <span>{sz.replace('px', '')}</span>
                          {currentSize === sz && <Check size={12} className="text-[#2b579a]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* A+ Increase Font Size */}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleStepSize(1)}
                  className="h-7 px-2 hover:bg-slate-100 rounded text-slate-800 font-black text-xs transition cursor-pointer flex items-center gap-0.5 border border-slate-200"
                  title="Increase Font Size (A+)"
                >
                  <span className="text-sm">A</span>
                  <span className="text-[9px] font-black text-emerald-600">▲</span>
                </button>

                {/* A- Decrease Font Size */}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleStepSize(-1)}
                  className="h-7 px-2 hover:bg-slate-100 rounded text-slate-800 font-black text-xs transition cursor-pointer flex items-center gap-0.5 border border-slate-200"
                  title="Decrease Font Size (A-)"
                >
                  <span className="text-xs">A</span>
                  <span className="text-[9px] font-black text-rose-600">▼</span>
                </button>

                {/* Clear Formatting */}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec('removeFormat')}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition cursor-pointer"
                  title="Clear Formatting"
                >
                  <RemoveFormatting size={14} />
                </button>

                <div className="h-4 w-px bg-slate-200 mx-0.5" />

                {/* Insert Hyperlink (Ctrl+K) */}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={openLinkModal}
                  className="h-7 px-2.5 bg-blue-50/80 hover:bg-blue-100 hover:border-blue-300 border border-blue-200 text-[#2b579a] rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title="Insert Hyperlink (Ctrl+K)"
                >
                  <LinkIcon size={13} className="text-[#2b579a]" />
                  <span>Insert Link</span>
                </button>
              </div>

              {/* Row 2: B, I, U, S, Sub, Super, Text Color, Highlight */}
              <div className="flex items-center gap-0.5 mt-1">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec('bold')}
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-800 font-black transition cursor-pointer"
                  title="Bold (Ctrl+B)"
                >
                  <Bold size={14} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec('italic')}
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-800 italic transition cursor-pointer"
                  title="Italic (Ctrl+I)"
                >
                  <Italic size={14} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec('underline')}
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-800 underline transition cursor-pointer"
                  title="Underline (Ctrl+U)"
                >
                  <Underline size={14} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec('strikeThrough')}
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-800 line-through transition cursor-pointer"
                  title="Strikethrough"
                >
                  <Strikethrough size={14} />
                </button>

                <div className="h-4 w-px bg-slate-200 mx-1" />

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec('subscript')}
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition cursor-pointer"
                  title="Subscript (X₂)"
                >
                  <Subscript size={13} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec('superscript')}
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition cursor-pointer"
                  title="Superscript (X²)"
                >
                  <Superscript size={13} />
                </button>

                <div className="h-4 w-px bg-slate-200 mx-1" />

                {/* Font Color */}
                <div className="color-menu-container relative">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setColorMenuOpen(!colorMenuOpen);
                      setHighlightMenuOpen(false);
                      setFontSizeMenuOpen(false);
                      setFontFamilyMenuOpen(false);
                      setLineSpacingMenuOpen(false);
                    }}
                    className="p-1 hover:bg-slate-100 rounded transition cursor-pointer flex flex-col items-center justify-center px-1.5"
                    title="Font Color"
                  >
                    <span className="font-serif font-black text-sm leading-none text-slate-900">A</span>
                    <span className="w-4 h-1 bg-[#C62828] rounded-full mt-0.5"></span>
                  </button>

                  {colorMenuOpen && (
                    <div
                      onMouseDown={(e) => e.preventDefault()}
                      className="absolute top-full left-0 mt-1.5 z-40 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xl grid grid-cols-4 gap-1.5 w-44 animate-fadeIn"
                    >
                      {TEXT_COLORS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleColorChange(c.value)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 hover:scale-110 transition shadow-2xs cursor-pointer"
                          style={{ backgroundColor: c.value }}
                          title={c.label}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Highlight Color */}
                <div className="highlight-menu-container relative ml-0.5">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setHighlightMenuOpen(!highlightMenuOpen);
                      setColorMenuOpen(false);
                      setFontSizeMenuOpen(false);
                      setFontFamilyMenuOpen(false);
                      setLineSpacingMenuOpen(false);
                    }}
                    className="p-1 hover:bg-slate-100 rounded transition cursor-pointer flex flex-col items-center justify-center px-1.5"
                    title="Text Highlight Color"
                  >
                    <Highlighter size={14} className="text-amber-500" />
                    <span className="w-4 h-1 bg-amber-400 rounded-full mt-0.5"></span>
                  </button>

                  {highlightMenuOpen && (
                    <div
                      onMouseDown={(e) => e.preventDefault()}
                      className="absolute top-full left-0 mt-1.5 z-40 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xl grid grid-cols-3 gap-1.5 w-48 animate-fadeIn"
                    >
                      {HIGHLIGHT_COLORS.map((h) => (
                        <button
                          key={h.value}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleHighlightChange(h.value)}
                          className="h-7 px-2 text-[10px] font-bold rounded-lg border border-slate-200 hover:scale-105 transition truncate cursor-pointer"
                          style={{ backgroundColor: h.value === 'transparent' ? '#ffffff' : h.value }}
                          title={h.label}
                        >
                          {h.label.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center mt-1">
                Font
              </div>
            </div>

            {/* Group 3: Paragraph */}
            <div className="flex flex-col justify-between pr-3 border-r border-slate-200 shrink-0">
              {/* Row 1: Bullet list, Numbered list, Outdent, Indent, Line spacing */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec('insertUnorderedList')}
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition cursor-pointer"
                  title="Bullet List"
                >
                  <List size={14} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec('insertOrderedList')}
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition cursor-pointer"
                  title="Numbered List"
                >
                  <ListOrdered size={14} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec('outdent')}
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition cursor-pointer"
                  title="Decrease Indent (Outdent)"
                >
                  <Outdent size={14} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec('indent')}
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition cursor-pointer"
                  title="Increase Indent"
                >
                  <Indent size={14} />
                </button>

                {/* Line Spacing Dropdown */}
                <div className="line-spacing-container relative">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setLineSpacingMenuOpen(!lineSpacingMenuOpen)}
                    className="px-1.5 py-1 hover:bg-slate-100 rounded text-slate-700 font-semibold text-[11px] flex items-center gap-0.5 border border-slate-200 cursor-pointer"
                    title="Line Spacing"
                  >
                    <span>1.6x</span>
                    <ChevronDown size={11} />
                  </button>

                  {lineSpacingMenuOpen && (
                    <div
                      onMouseDown={(e) => e.preventDefault()}
                      className="absolute top-full left-0 mt-1 z-40 bg-white border border-slate-200 rounded-xl p-1.5 shadow-xl w-32 space-y-0.5 animate-fadeIn"
                    >
                      {['1.0', '1.15', '1.5', '1.6', '2.0'].map((sp) => (
                        <button
                          key={sp}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleLineSpacing(sp)}
                          className="w-full text-left px-2.5 py-1 text-xs hover:bg-slate-100 rounded font-semibold text-slate-700 cursor-pointer"
                        >
                          Line Height {sp}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Align Left, Center, Right, Justify */}
              <div className="flex items-center gap-0.5 mt-1">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec('justifyLeft')}
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition cursor-pointer"
                  title="Align Left (Ctrl+L)"
                >
                  <AlignLeft size={14} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec('justifyCenter')}
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition cursor-pointer"
                  title="Align Center (Ctrl+E)"
                >
                  <AlignCenter size={14} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec('justifyRight')}
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition cursor-pointer"
                  title="Align Right (Ctrl+R)"
                >
                  <AlignRight size={14} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec('justifyFull')}
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition cursor-pointer"
                  title="Justify (Ctrl+J)"
                >
                  <AlignJustify size={14} />
                </button>
              </div>

              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center mt-1">
                Paragraph
              </div>
            </div>

            {/* Group 4: Quick Styles */}
            <div className="flex flex-col justify-between pr-3 shrink-0">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyFormatBlock('<p>')}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-lg text-center transition cursor-pointer hover:border-[#2b579a] shadow-2xs group"
                  title="Normal Paragraph"
                >
                  <div className="text-xs font-bold text-slate-900 group-hover:text-[#2b579a]">Normal</div>
                  <div className="text-[10px] text-slate-400">Body Text</div>
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyFormatBlock('<h2>')}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-lg text-center transition cursor-pointer hover:border-[#2b579a] shadow-2xs group"
                  title="Main Section Heading (H2)"
                >
                  <div className="text-xs font-black text-slate-900 group-hover:text-[#2b579a]">Heading 1</div>
                  <div className="text-[10px] text-slate-400">Section H2</div>
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyFormatBlock('<h3>')}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-lg text-center transition cursor-pointer hover:border-[#2b579a] shadow-2xs group"
                  title="Sub-Heading (H3)"
                >
                  <div className="text-xs font-extrabold text-slate-900 group-hover:text-[#2b579a]">Heading 2</div>
                  <div className="text-[10px] text-slate-400">Sub-Section</div>
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyFormatBlock('<blockquote>')}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-lg text-center transition cursor-pointer hover:border-[#2b579a] shadow-2xs group"
                  title="Blockquote"
                >
                  <div className="text-xs font-bold italic text-slate-900 group-hover:text-[#2b579a]">Quote</div>
                  <div className="text-[10px] text-slate-400">Callout</div>
                </button>
              </div>

              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center mt-1">
                Styles
              </div>
            </div>
          </>
        )}

        {/* ================= TAB 2: INSERT ================= */}
        {ribbonTab === 'insert' && (
          <div className="flex items-center gap-3 w-full">
            {/* Insert Table */}
            <div className="flex flex-col items-center justify-center px-3 border-r border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setTableModalOpen(true)}
                className="h-10 px-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer shadow-2xs"
                title="Insert Data Table"
              >
                <Table size={16} />
                <span>Insert Table</span>
              </button>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Table</span>
            </div>

            {/* Insert Image & Media */}
            <div className="flex items-center gap-2 px-3 border-r border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setImageModalOpen(true)}
                className="h-10 px-3 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-rose-700 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer shadow-2xs"
                title="Upload image from computer"
              >
                <Upload size={15} />
                <span>Upload Image</span>
              </button>

              <button
                type="button"
                onClick={() => setMediaLibraryOpen(true)}
                className="h-10 px-3 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-indigo-700 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer shadow-2xs"
                title="Shared Media Library"
              >
                <FolderOpen size={15} />
                <span>Media Library</span>
              </button>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1">Media</span>
            </div>

            {/* Insert Link & Button CTA */}
            <div className="flex items-center gap-2 px-3 border-r border-slate-200 shrink-0">
              <button
                type="button"
                onClick={openLinkModal}
                className="h-10 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer shadow-2xs"
                title="Insert Hyperlink (Ctrl+K)"
              >
                <LinkIcon size={14} className="text-[#2b579a]" />
                <span>Insert Link</span>
              </button>

              <button
                type="button"
                onClick={() => setButtonModalOpen(true)}
                className="h-10 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer shadow-2xs"
                title="Insert CTA Button"
              >
                <MousePointerClick size={15} className="text-[#C62828]" />
                <span>+ CTA Button</span>
              </button>

              <button
                type="button"
                onClick={() => exec('insertHorizontalRule')}
                className="h-10 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                title="Horizontal Divider Line"
              >
                <Minus size={15} />
                <span>Divider</span>
              </button>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1">Links &amp; Dividers</span>
            </div>

            {/* Callout Boxes */}
            <div className="flex items-center gap-2 px-3 shrink-0">
              <button
                type="button"
                onClick={() => insertCallout('tip')}
                className="h-10 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <Lightbulb size={14} className="text-emerald-600" />
                <span>Tip Box</span>
              </button>
              <button
                type="button"
                onClick={() => insertCallout('warning')}
                className="h-10 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <AlertTriangle size={14} className="text-rose-600" />
                <span>Warning Box</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 3: AFFILIATE BLOCKS ================= */}
        {ribbonTab === 'affiliate' && (
          <div className="flex items-center gap-3 w-full">
            {/* Deal Box */}
            <button
              type="button"
              onClick={() => {
                setEditingBoxEl(null);
                setDealModalOpen(true);
              }}
              className="h-10 px-4 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-xl font-black flex items-center gap-2 transition cursor-pointer shadow-sm shrink-0"
              title="Insert Promo Deal Box"
            >
              <Tag size={15} />
              <span>+ Insert Promo Deal Box</span>
            </button>

            {/* Pros & Cons */}
            <button
              type="button"
              onClick={insertProsCons}
              className="h-10 px-3.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer shadow-2xs shrink-0"
              title="Pros & Cons Comparison Grid"
            >
              <Scale size={15} className="text-teal-600" />
              <span>Pros / Cons Grid</span>
            </button>

            {/* Verdict Box */}
            <button
              type="button"
              onClick={() => insertCallout('verdict')}
              className="h-10 px-3.5 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer shadow-2xs shrink-0"
              title="Lab Editorial Verdict Box"
            >
              <Trophy size={15} className="text-amber-400" />
              <span>Editor's Choice Verdict</span>
            </button>

            {/* Add Component Library */}
            <button
              type="button"
              onClick={() => setAddCompModalOpen(true)}
              className="h-10 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 transition cursor-pointer shadow-2xs shrink-0"
              title="Pre-designed Article Section Templates"
            >
              <LayoutGrid size={15} />
              <span>Section Template Library</span>
            </button>
          </div>
        )}

        {/* ================= TAB 4: LAYOUT & VIEW ================= */}
        {ribbonTab === 'view' && (
          <div className="flex items-center gap-4 w-full">
            {/* A4 Page vs Full Width */}
            <div className="flex items-center gap-2 pr-4 border-r border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setIsPaperView(true)}
                className={`h-10 px-3.5 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer shadow-2xs ${
                  isPaperView
                    ? 'bg-[#2b579a] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FileText size={15} />
                <span>A4 Paper Canvas (Word)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPaperView(false)}
                className={`h-10 px-3.5 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer shadow-2xs ${
                  !isPaperView
                    ? 'bg-[#2b579a] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Maximize2 size={15} />
                <span>Full-Width Canvas (100%)</span>
              </button>
            </div>

            {/* Zoom */}
            <div className="flex items-center gap-2 pr-4 border-r border-slate-200 shrink-0">
              <span className="text-xs text-slate-500 font-semibold">Zoom:</span>
              {[90, 100, 115, 125].map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setZoomLevel(z)}
                  className={`h-8 px-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    zoomLevel === z
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {z}%
                </button>
              ))}
            </div>

            {/* Fullscreen & Code View */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="h-10 px-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer shadow-2xs"
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen 100%'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSourceMode(!isSourceMode)}
                className={`h-10 px-3.5 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer shadow-2xs ${
                  isSourceMode ? 'bg-amber-400 text-slate-950' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {isSourceMode ? <Eye size={14} /> : <Code2 size={14} />}
                <span>{isSourceMode ? 'Visual Mode' : 'HTML Source'}</span>
              </button>

              <button
                type="button"
                onClick={() => setFullPreviewOpen(true)}
                className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 transition cursor-pointer shadow-sm"
                title="Preview article in real client website layout"
              >
                <Eye size={15} />
                <span>Full-Page Live Preview</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* =========================================================================
          ACTIVE COMPONENT ACTION BAR (TOP PINNED SLATE STRIP - NEVER WRAPS)
         ========================================================================= */}
      {activeComp && !isSourceMode && (
        <div className="bg-slate-900 border-b border-slate-800 px-3.5 py-2 flex items-center justify-between gap-3 text-xs text-white shadow-md sticky top-0 z-20 overflow-x-auto whitespace-nowrap scrollbar-none animate-fadeIn">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="font-semibold text-slate-300 text-xs">
              Selected Block: <strong className="text-white font-black">{getComponentLabel(activeComp)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Move Up */}
            <button
              type="button"
              onClick={moveComponentUp}
              className="h-7 px-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-lg font-bold flex items-center gap-1 transition cursor-pointer text-xs shrink-0"
              title="Move block up"
            >
              <ArrowUp size={13} /> Up
            </button>

            {/* Move Down */}
            <button
              type="button"
              onClick={moveComponentDown}
              className="h-7 px-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-lg font-bold flex items-center gap-1 transition cursor-pointer text-xs shrink-0"
              title="Move block down"
            >
              <ArrowDown size={13} /> Down
            </button>

            {/* Clone */}
            <button
              type="button"
              onClick={cloneComponent}
              className="h-7 px-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-lg font-bold flex items-center gap-1 transition cursor-pointer text-xs shrink-0"
              title="Duplicate this block"
            >
              <Copy size={13} /> Duplicate
            </button>

            {/* Style Dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setStyleDropdownOpen(!styleDropdownOpen)}
                className="h-7 px-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer text-xs shrink-0"
                title="Change block border & background style"
              >
                <Palette size={13} className="text-indigo-400" />
                <span>Block Style</span>
                <ChevronDown size={12} />
              </button>

              {styleDropdownOpen && (
                <div className="absolute top-full right-0 mt-1.5 z-40 bg-white border border-slate-200 rounded-2xl p-2 shadow-2xl w-64 space-y-1 animate-fadeIn text-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Select Block Style:
                  </div>
                  <button
                    type="button"
                    onClick={() => applyComponentStyle('white')}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="w-3.5 h-3.5 rounded border border-slate-300 bg-white shadow-2xs shrink-0"></span>
                    <span>Standard White Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyComponentStyle('deal')}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-rose-50 rounded-xl text-xs font-semibold text-rose-900 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="w-3.5 h-3.5 rounded border border-rose-500 bg-rose-50 shadow-2xs shrink-0"></span>
                    <span>Featured Deal Box (Red/Orange)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyComponentStyle('dark')}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-900 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="w-3.5 h-3.5 rounded bg-slate-900 shadow-2xs shrink-0"></span>
                    <span>Premium Dark Card (Verdict)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyComponentStyle('emerald')}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-emerald-50 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="w-3.5 h-3.5 rounded border border-emerald-400 bg-emerald-50 shadow-2xs shrink-0"></span>
                    <span>Pro Emerald Card (Pros/Tip)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyComponentStyle('amber')}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-amber-50 rounded-xl text-xs font-semibold text-amber-900 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="w-3.5 h-3.5 rounded border border-amber-400 bg-amber-50 shadow-2xs shrink-0"></span>
                    <span>Amber Caution Card (Note)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyComponentStyle('minimal')}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-2 cursor-pointer border-t border-slate-100 mt-1 pt-1.5"
                  >
                    <span className="w-3.5 h-3.5 rounded border border-dashed border-slate-300 bg-transparent shrink-0"></span>
                    <span>Minimal Borderless Section</span>
                  </button>
                </div>
              )}
            </div>

            {/* Insert Image */}
            <button
              type="button"
              onClick={() => setImageModalOpen(true)}
              className="h-7 px-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-lg font-bold flex items-center gap-1 transition cursor-pointer text-xs shrink-0"
              title="Insert image into this block"
            >
              <ImageIcon size={13} className="text-indigo-400" /> Insert Image
            </button>

            {/* Media Library */}
            <button
              type="button"
              onClick={() => setMediaLibraryOpen(true)}
              className="h-7 px-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 hover:text-white rounded-lg font-bold flex items-center gap-1 transition cursor-pointer text-xs shrink-0"
              title="Choose image from Media Library"
            >
              <FolderOpen size={13} className="text-indigo-400" /> Media Library
            </button>

            {/* Delete Block Button */}
            <button
              type="button"
              onClick={deleteActiveBox}
              className="h-7 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-xs text-xs shrink-0 ml-1"
              title="Delete selected block/component"
            >
              <Trash2 size={13} />
              <span>Delete Block</span>
            </button>
          </div>
        </div>
      )}
      </div>

      {/* =========================================================================
          EDITOR CANVAS: DRAG & DROP IMAGES, INTERACTIVE EDITORIAL BOXES
         ========================================================================= */}
      <div
        ref={canvasScrollRef}
        className={`relative flex-1 min-h-0 overflow-y-auto scroll-smooth bg-white ${
          isFullscreen ? '' : 'max-h-[70vh]'
        }`}
      >
        {/* FLOATING ACTION TOOLBAR DOCKED DIRECTLY TO ACTIVE CARD */}
        {activeComp && !isSourceMode && activeCompRect && (
          <div
            className="absolute z-20 pointer-events-auto transition-all duration-150 flex items-center gap-1 bg-slate-950/95 text-white backdrop-blur-md px-3 py-1.5 rounded-xl shadow-2xl border border-slate-700/80 text-xs animate-fadeIn select-none"
            style={{
              top: `${Math.max(8, activeCompRect.top - 16)}px`,
              right: `${activeCompRect.right}px`,
            }}
          >
            <span className="font-extrabold text-slate-200 text-[11px] truncate max-w-[150px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {getComponentLabel(activeComp)}
            </span>
            <div className="h-3.5 w-px bg-slate-700 mx-1" />
            <button
              type="button"
              onClick={moveComponentUp}
              className="px-1.5 py-0.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition flex items-center gap-0.5 text-[11px] font-semibold cursor-pointer"
              title="Move block up"
            >
              <ArrowUp size={12} /> Up
            </button>
            <button
              type="button"
              onClick={moveComponentDown}
              className="px-1.5 py-0.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition flex items-center gap-0.5 text-[11px] font-semibold cursor-pointer"
              title="Move block down"
            >
              <ArrowDown size={12} /> Down
            </button>
            <button
              type="button"
              onClick={cloneComponent}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition cursor-pointer"
              title="Duplicate block"
            >
              <Copy size={12} />
            </button>
            <button
              type="button"
              onClick={() => setStyleDropdownOpen(!styleDropdownOpen)}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition cursor-pointer"
              title="Change block style"
            >
              <Palette size={12} />
            </button>
            <div className="h-3.5 w-px bg-slate-700 mx-1" />
            <button
              type="button"
              onClick={deleteActiveBox}
              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-lg transition flex items-center gap-1 text-[11px] shadow-xs cursor-pointer"
              title="Delete this block from article"
            >
              <Trash2 size={12} />
              <span>Delete</span>
            </button>
          </div>
        )}
        {isSourceMode ? (
          <textarea
            value={sourceCode}
            onChange={handleSourceChange}
            className="w-full p-5 font-mono text-xs text-emerald-400 bg-slate-900 focus:outline-none resize-y min-h-[500px]"
            style={{ minHeight }}
            placeholder="Edit raw HTML markup..."
          />
        ) : (
          <div className={`w-full transition-all duration-200 ${
            isPaperView
              ? 'bg-[#eef2f7] p-4 sm:p-10 flex justify-center items-start min-h-[750px]'
              : 'bg-white p-4 sm:p-8 min-h-[500px]'
          }`}>
            <div
              className={
                isPaperView
                  ? 'w-full max-w-[850px] bg-white min-h-[1050px] shadow-2xl shadow-slate-400/25 border border-slate-300/80 rounded-xs px-8 py-10 sm:px-16 sm:py-16 my-2 transition-all relative'
                  : 'w-full max-w-none'
              }
              style={{
                transform: isPaperView && zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
                transformOrigin: 'top center',
              }}
            >
              <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onBlur={handleInput}
                onClick={handleEditorClick}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                    e.preventDefault();
                    openLinkModal();
                  }
                }}
                onSelect={() => {
                  captureEditorSelection(false);
                }}
                onKeyUp={() => {
                  captureEditorSelection(true);
                  const sel = window.getSelection();
                  if (sel?.anchorNode) {
                    const comp = findEnclosingComponent(sel.anchorNode);
                    selectComponent(comp);
                  }
                }}
                onMouseUp={() => {
                  captureEditorSelection(true);
                  const sel = window.getSelection();
                  if (sel?.anchorNode) {
                    const comp = findEnclosingComponent(sel.anchorNode);
                    selectComponent(comp);
                  }
                }}
                onDrop={handleEditorDrop}
                className="w-full focus:outline-none font-sans leading-relaxed text-slate-900 prose prose-slate max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2 prose-p:my-3 prose-p:leading-relaxed prose-a:text-[#2b579a] prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-[#2b579a] prose-blockquote:italic prose-blockquote:pl-4 prose-blockquote:my-4 prose-img:rounded-xl prose-ul:list-disc prose-ol:list-decimal"
                style={{ minHeight: isPaperView ? '900px' : minHeight, fontSize: '15px' }}
                data-placeholder={placeholder}
              />
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MICROSOFT WORD STATUS BAR (BOTTOM BLUE DOCK)
         ========================================================================= */}
      <div className="shrink-0 bg-[#2b579a] text-white px-4 py-1.5 text-xs flex items-center justify-between select-none shadow-inner border-t border-[#204477] rounded-b-2xl">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-bold">
            <FileText size={12} className="text-white/80" />
            <span>Page 1 of 1</span>
          </span>
          <span>Words: <strong className="text-white">{stats.words}</strong></span>
          <span>Characters: <strong className="text-white">{stats.characters}</strong></span>
          <span className="hidden sm:inline">Reading time: <strong className="text-amber-300">{stats.readTime}</strong></span>
        </div>

        <div className="flex items-center gap-3">
          {/* Paper View Switcher */}
          <button
            type="button"
            onClick={() => setIsPaperView(!isPaperView)}
            className="text-[11px] font-bold text-white/90 hover:text-white flex items-center gap-1 cursor-pointer hover:underline"
          >
            <span>{isPaperView ? '📄 A4 Word Page' : '⛶ Full Width 100%'}</span>
          </button>

          {/* Zoom Slider */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-white/90 bg-white/10 px-2 py-0.5 rounded">
            <button
              type="button"
              onClick={() => setZoomLevel(Math.max(70, zoomLevel - 10))}
              className="hover:text-amber-300 font-black cursor-pointer px-1"
              title="Zoom out (-10%)"
            >
              -
            </button>
            <span className="w-9 text-center font-bold text-white">{zoomLevel}%</span>
            <button
              type="button"
              onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
              className="hover:text-amber-300 font-black cursor-pointer px-1"
              title="Zoom in (+10%)"
            >
              +
            </button>
          </div>
          
          <span className="text-[10px] text-white/60 font-mono hidden md:inline">
            Word Studio v3.0
          </span>
        </div>
      </div>
    </div>

      {/* =========================================================================
          MODAL: CONFIGURE DEAL BOX & BUTTON LINK
         ========================================================================= */}
      {dealModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tag size={16} className="text-[#C62828]" />
                <span>{editingBoxEl ? 'Edit Deal Box & Button Link' : 'Insert New Deal Box'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setDealModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Name / Deal Title *</label>
                <input
                  type="text"
                  value={dealForm.title}
                  onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                  placeholder="e.g. Nilight 20-Inch Curved LED Light Bar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Deal Price *</label>
                  <input
                    type="text"
                    value={dealForm.dealPrice}
                    onChange={(e) => setDealForm({ ...dealForm, dealPrice: e.target.value })}
                    placeholder="$49.99"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828] font-bold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Original List Price</label>
                  <input
                    type="text"
                    value={dealForm.originalPrice}
                    onChange={(e) => setDealForm({ ...dealForm, originalPrice: e.target.value })}
                    placeholder="$89.99"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Promo / Coupon Code</label>
                  <input
                    type="text"
                    value={dealForm.couponCode}
                    onChange={(e) => setDealForm({ ...dealForm, couponCode: e.target.value })}
                    placeholder="HEYGOODLY20"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Badge Label</label>
                  <input
                    type="text"
                    value={dealForm.badge}
                    onChange={(e) => setDealForm({ ...dealForm, badge: e.target.value })}
                    placeholder="Verified Exclusive Deal"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828]"
                  />
                </div>
              </div>

              {/* BUTTON LINK SETTINGS */}
              <div className="pt-2 border-t border-slate-100 space-y-3 bg-rose-50/40 p-3 rounded-xl border">
                <div>
                  <label className="font-bold text-slate-900 block mb-1 flex items-center justify-between">
                    <span>Button Display Text *</span>
                    <span className="text-[10px] text-slate-400">Button CTA Text</span>
                  </label>
                  <input
                    type="text"
                    value={dealForm.buttonText}
                    onChange={(e) => setDealForm({ ...dealForm, buttonText: e.target.value })}
                    placeholder="Claim Deal at Official Store →"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828] font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-900 block mb-1 flex items-center justify-between">
                    <span>Button Destination Link (Affiliate / Checkout URL) *</span>
                    <span className="text-[10px] text-slate-400">Target Destination</span>
                  </label>
                  <input
                    type="url"
                    value={dealForm.buttonUrl}
                    onChange={(e) => setDealForm({ ...dealForm, buttonUrl: e.target.value })}
                    placeholder="https://www.nilight.com/?ref=heygoodly"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828] font-mono text-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDealModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDealBox}
                className="px-5 py-2 text-xs font-bold bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-lg shadow transition"
              >
                {editingBoxEl ? 'Update Box & Button Link' : 'Insert Deal Box'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: INSERT STANDALONE CTA BUTTON
         ========================================================================= */}
      {buttonModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MousePointerClick size={16} className="text-[#C62828]" />
                <span>Insert New CTA Button</span>
              </h3>
              <button
                type="button"
                onClick={() => setButtonModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Button Label *</label>
                <input
                  type="text"
                  value={buttonForm.text}
                  onChange={(e) => setButtonForm({ ...buttonForm, text: e.target.value })}
                  placeholder="e.g. Check Verified Price on Merchant Store →"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828] font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Destination URL *</label>
                <input
                  type="url"
                  value={buttonForm.url}
                  onChange={(e) => setButtonForm({ ...buttonForm, url: e.target.value })}
                  placeholder="https://example.com/deal"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Button Style</label>
                  <select
                    value={buttonForm.style}
                    onChange={(e) => setButtonForm({ ...buttonForm, style: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828]"
                  >
                    <option value="crimson">Crimson Red (HeyGoodly)</option>
                    <option value="emerald">Emerald Green</option>
                    <option value="dark">Dark Slate</option>
                    <option value="outline">Transparent Outline</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Alignment</label>
                  <select
                    value={buttonForm.alignment}
                    onChange={(e) => setButtonForm({ ...buttonForm, alignment: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828]"
                  >
                    <option value="center">Center</option>
                    <option value="left">Left</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setButtonModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertButton}
                disabled={!buttonForm.text.trim()}
                className="px-5 py-2 text-xs font-bold bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-lg shadow transition"
              >
                Insert Button
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: UPLOAD & INSERT IMAGE INTO ARTICLE BODY
         ========================================================================= */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon size={16} className="text-[#C62828]" />
                <span>Upload &amp; Insert Image into Article Body</span>
              </h3>
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Option 1: Drag & drop / Click to Upload File */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  1. Upload image from computer (PNG, JPG, WEBP, GIF)
                </label>
                <label className="border-2 border-dashed border-slate-200 hover:border-[#C62828] rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-rose-50/20 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleModalImageUpload}
                    className="hidden"
                  />
                  {isUploadingImage ? (
                    <div className="space-y-2 text-center py-2">
                      <div className="text-xs font-bold text-[#C62828]">Uploading image to server...</div>
                      <div className="w-40 bg-slate-200 h-1.5 rounded-full overflow-hidden mx-auto">
                        <div className="bg-[#C62828] h-full" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  ) : imageUrl ? (
                    <div className="text-center space-y-1">
                      <CheckCircle2 size={24} className="mx-auto text-emerald-500" />
                      <span className="font-bold text-emerald-700">Image uploaded successfully!</span>
                      <p className="text-[10px] text-slate-400 truncate max-w-xs">{imageUrl}</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-1">
                      <Upload size={22} className="mx-auto text-[#C62828]" />
                      <span className="font-bold text-slate-800">Select an image file from your computer</span>
                      <p className="text-[10px] text-slate-400">or drag &amp; drop an image directly here</p>
                    </div>
                  )}
                </label>
              </div>

              {/* Option 2: Image URL direct */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800 block">
                    2. Or paste a direct image URL
                  </label>
                  <button
                    type="button"
                    onClick={() => setMediaLibraryOpen(true)}
                    className="h-6 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md font-bold text-[11px] flex items-center gap-1 transition cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <FolderOpen size={12} />
                    <span>Choose from Media Library</span>
                  </button>
                </div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or /uploads/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828] font-mono"
                />
              </div>

              {/* Caption & Alignment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Alignment</label>
                  <select
                    value={imageAlign}
                    onChange={(e) => setImageAlign(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828]"
                  >
                    <option value="center">Center</option>
                    <option value="full">Full Width</option>
                    <option value="left">Float Left</option>
                    <option value="right">Float Right</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Image Caption</label>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="e.g. Real-world brightness test results..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828]"
                  />
                </div>
              </div>

              {/* Mandatory Tag Input */}
              <div className="pt-2 border-t border-slate-100">
                <MediaTagInput
                  tags={imageTags}
                  onChange={setImageTags}
                  required={true}
                  label="Category Tags (Minimum 1 required)"
                  placeholder="Type a tag and press Enter (e.g., review, iphone, specs...)"
                  helperText="This image will be automatically indexed into the Media Library with these tags for future lookup."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyImageModal}
                disabled={!imageUrl.trim() || imageTags.length === 0}
                className="px-5 py-2 text-xs font-bold bg-[#C62828] hover:bg-[#B71C1C] disabled:bg-slate-300 text-white rounded-lg shadow transition cursor-pointer disabled:cursor-not-allowed"
              >
                Insert Image ({imageTags.length} {imageTags.length === 1 ? 'tag' : 'tags'})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: INSERT / EDIT HYPERLINK & AFFILIATE LINK
         ========================================================================= */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2b579a]">
                  <LinkIcon size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Insert Hyperlink</h3>
                  <p className="text-[11px] text-slate-500">Quick shortcut: Select text and press <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200 font-bold">Ctrl+K</kbd></p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Destination URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com/affiliate-deal"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#2b579a] font-mono text-xs"
                  autoFocus
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Display Text (Anchor Text)
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. Check exclusive discount price at official store"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#2b579a] text-xs"
                />
                <p className="text-[10px] text-slate-400 mt-1">Leave blank to display the raw URL.</p>
              </div>

              {/* Advanced SEO & Affiliate Options */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900 select-none">
                  <input
                    type="checkbox"
                    checked={linkTargetBlank}
                    onChange={(e) => setLinkTargetBlank(e.target.checked)}
                    className="rounded text-[#2b579a] focus:ring-[#2b579a]"
                  />
                  <span className="font-medium">Open in new tab (<code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-600">target="_blank"</code>)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900 select-none">
                  <input
                    type="checkbox"
                    checked={linkSponsored}
                    onChange={(e) => setLinkSponsored(e.target.checked)}
                    className="rounded text-[#2b579a] focus:ring-[#2b579a]"
                  />
                  <span className="font-medium">Affiliate / Sponsored attribute (<code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-600">rel="nofollow sponsored"</code>)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                disabled={!linkUrl.trim()}
                className="px-4 py-1.5 text-xs font-bold bg-[#2b579a] hover:bg-[#1f4277] disabled:bg-slate-300 text-white rounded-lg transition cursor-pointer shadow-xs"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD NEW COMPONENT / SECTION
         ========================================================================= */}
      {addCompModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 animate-fadeIn max-h-[92vh] flex flex-col transition-all duration-200 ${
            selectedTemplateForParams ? 'max-w-6xl w-[96vw]' : 'max-w-3xl w-full'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              {selectedTemplateForParams ? (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTemplateForParams(null)}
                    className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                    title="Back to template list"
                  >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>
                  <div className="h-5 w-px bg-slate-200" />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <Settings size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                        <span>Configure Parameters: {selectedTemplateForParams.name}</span>
                        {selectedTemplateForParams.badge && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {selectedTemplateForParams.badge}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500">Customize pricing, promo codes, headings, or copy before inserting into the article.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <LayoutTemplate size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Editorial &amp; Affiliate Component Library</h3>
                    <p className="text-xs text-slate-500">Insert pre-designed SEO-ready content blocks with 1 click or customize their parameters.</p>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setSelectedTemplateForParams(null);
                  setAddCompModalOpen(false);
                }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content view depending on selectedTemplateForParams */}
            {selectedTemplateForParams ? (
              /* ================= PARAMETER FORM & TRUE DIMENSION PREVIEW VIEW ================= */
              <div className="flex flex-col lg:flex-row gap-5 overflow-hidden flex-1 min-h-0">
                {/* Left Column: Parameter Fields */}
                <div className="w-full lg:w-[400px] shrink-0 space-y-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200 overflow-y-auto max-h-[540px]">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>⚙️</span> Block Parameters
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">Instant live preview</span>
                  </div>

                  <div className="space-y-3">
                    {getTemplateParamFields(selectedTemplateForParams.id).map((field) => (
                      <div key={field.key} className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          {field.label}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea
                            rows={3}
                            value={templateParams[field.key] ?? ''}
                            onChange={(e) =>
                              setTemplateParams({
                                ...templateParams,
                                [field.key]: e.target.value,
                              })
                            }
                            placeholder={field.placeholder}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 font-sans resize-y leading-relaxed shadow-2xs"
                          />
                        ) : field.type === 'url' ? (
                          <input
                            type="url"
                            value={templateParams[field.key] ?? ''}
                            onChange={(e) =>
                              setTemplateParams({
                                ...templateParams,
                                [field.key]: e.target.value,
                              })
                            }
                            placeholder={field.placeholder}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 font-mono shadow-2xs"
                          />
                        ) : (
                          <input
                            type="text"
                            value={templateParams[field.key] ?? ''}
                            onChange={(e) =>
                              setTemplateParams({
                                ...templateParams,
                                [field.key]: e.target.value,
                              })
                            }
                            placeholder={field.placeholder}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 font-sans shadow-2xs"
                          />
                        )}
                        {field.help && <p className="text-[10px] text-slate-400">{field.help}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: True Dimension Live Preview */}
                <div className="flex-1 min-w-0 flex flex-col space-y-2 bg-slate-100/70 p-4 rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span>👁️</span> True-Dimension Live Preview
                      </span>
                      <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Realtime
                      </span>
                    </div>

                    {/* Device Switcher */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-xs">
                      <button
                        type="button"
                        onClick={() => setTemplatePreviewDevice('desktop')}
                        className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          templatePreviewDevice === 'desktop'
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Preview at Desktop article width (780px)"
                      >
                        <Monitor size={13} />
                        <span>Desktop (780px)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTemplatePreviewDevice('mobile')}
                        className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          templatePreviewDevice === 'mobile'
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Preview at Mobile viewport width (375px)"
                      >
                        <Smartphone size={13} />
                        <span>Mobile (375px)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTemplatePreviewDevice('full')}
                        className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                          templatePreviewDevice === 'full'
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Full width 100%"
                      >
                        <span>100%</span>
                      </button>
                    </div>
                  </div>

                  {/* Preview Canvas */}
                  <div className="flex-1 overflow-y-auto overflow-x-auto bg-slate-200/50 p-4 rounded-xl border border-slate-200 max-h-[500px] flex justify-center items-start">
                    <div
                      className={`transition-all duration-200 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/90 ${
                        templatePreviewDevice === 'desktop'
                          ? 'w-full max-w-[780px]'
                          : templatePreviewDevice === 'mobile'
                          ? 'w-[375px] max-w-full'
                          : 'w-full'
                      }`}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: buildTemplateHTML(selectedTemplateForParams.id, templateParams),
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ================= TEMPLATE CATALOG VIEW ================= */
              <>
                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    {['all', 'Article Structure', 'Deals & Promos', 'Reviews & Comparisons', 'Images & Media'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setTemplateCategory(cat)}
                        className={`h-7 px-3 rounded-lg text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                          templateCategory === cat
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat === 'all' ? 'All Templates' : cat}
                      </button>
                    ))}
                  </div>

                  <div className="relative shrink-0 sm:w-60">
                    <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search component templates..."
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                {/* Component Cards Grid */}
                <div className="overflow-y-auto space-y-3 pr-1 flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {COMPONENT_TEMPLATES.filter((tpl) => {
                      const matchCat = templateCategory === 'all' || tpl.category === templateCategory;
                      const matchSearch =
                        !templateSearch.trim() ||
                        tpl.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
                        tpl.description.toLowerCase().includes(templateSearch.toLowerCase());
                      return matchCat && matchSearch;
                    }).map((tpl) => (
                      <div
                        key={tpl.id}
                        className="border border-slate-200 hover:border-indigo-400 rounded-2xl p-4 transition bg-white hover:shadow-md flex flex-col justify-between gap-3 group"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {tpl.category}
                            </span>
                            {tpl.badge && (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {tpl.badge}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                            {tpl.name}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {tpl.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTemplateForParams(tpl);
                              setTemplateParams(getDefaultParamsForTemplate(tpl.id));
                            }}
                            className="h-8 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs whitespace-nowrap"
                            title="Customize parameters for this component before inserting"
                          >
                            <Settings size={13} />
                            <span>Customize</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTemplate(tpl.html)}
                            className="h-8 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1 transition cursor-pointer whitespace-nowrap shrink-0"
                            title="Quickly insert with default sample content"
                          >
                            <PlusCircle size={13} />
                            <span>Quick Insert</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 shrink-0">
              {selectedTemplateForParams ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setTemplateParams(getDefaultParamsForTemplate(selectedTemplateForParams.id))
                    }
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer flex items-center gap-1"
                  >
                    <span>↺ Reset to Defaults</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTemplateForParams(null)}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                    >
                      Cancel / Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const finalHTML = buildTemplateHTML(
                          selectedTemplateForParams.id,
                          templateParams
                        );
                        insertTemplate(finalHTML);
                        setSelectedTemplateForParams(null);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                    >
                      <PlusCircle size={14} />
                      <span>Apply &amp; Insert into Article</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full flex justify-end">
                  <button
                    type="button"
                    onClick={() => setAddCompModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: INSERT DATA TABLE (MICROSOFT WORD TABLE BUILDER)
         ========================================================================= */}
      {tableModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Table size={16} className="text-[#2b579a]" />
                <span>Insert Table Grid</span>
              </h3>
              <button
                type="button"
                onClick={() => setTableModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rows</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={tableRows}
                    onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 text-sm focus:outline-none focus:border-[#2b579a]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Columns</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={tableCols}
                    onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 text-sm focus:outline-none focus:border-[#2b579a]"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400">Quick table presets:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTableRows(3);
                      setTableCols(2);
                    }}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition cursor-pointer ${
                      tableRows === 3 && tableCols === 2 ? 'bg-[#2b579a] text-white border-[#2b579a]' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    3 × 2 cells
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTableRows(4);
                      setTableCols(3);
                    }}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition cursor-pointer ${
                      tableRows === 4 && tableCols === 3 ? 'bg-[#2b579a] text-white border-[#2b579a]' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    4 × 3 cells
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTableRows(5);
                      setTableCols(4);
                    }}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition cursor-pointer ${
                      tableRows === 5 && tableCols === 4 ? 'bg-[#2b579a] text-white border-[#2b579a]' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    5 × 4 cells
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setTableModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleInsertTable(tableRows, tableCols)}
                className="px-5 py-2 text-xs font-bold text-white bg-[#2b579a] hover:bg-[#204477] rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Table size={13} />
                <span>Insert Table</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: SHARED CENTRALIZED MEDIA LIBRARY
         ========================================================================= */}
      <MediaLibraryModal
        isOpen={mediaLibraryOpen}
        onClose={() => setMediaLibraryOpen(false)}
        onSelect={(selectedUrl) => {
          if (imageModalOpen) {
            setImageUrl(selectedUrl);
            setMediaLibraryOpen(false);
          } else {
            insertImageHTML(selectedUrl, 'Product illustration');
            setMediaLibraryOpen(false);
          }
        }}
        defaultFolder="articles"
      />

      {/* =========================================================================
          MODAL: FULL LIVE WEBSITE PREVIEW
         ========================================================================= */}
      {fullPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col p-2 sm:p-4 animate-fadeIn">
          {/* Top Bar with Device Switchers & Close */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 text-white shrink-0 mb-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Eye size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Live Website Preview</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Client View
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">Rendered accurately as readers see it on the live website</p>
              </div>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setFullPreviewDevice('desktop')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  fullPreviewDevice === 'desktop'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Desktop viewport (1100px)"
              >
                <Monitor size={14} />
                <span className="hidden sm:inline">Desktop (1100px)</span>
              </button>
              <button
                type="button"
                onClick={() => setFullPreviewDevice('tablet')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  fullPreviewDevice === 'tablet'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tablet viewport (768px)"
              >
                <Tablet size={14} />
                <span className="hidden sm:inline">Tablet (768px)</span>
              </button>
              <button
                type="button"
                onClick={() => setFullPreviewDevice('mobile')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  fullPreviewDevice === 'mobile'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Mobile viewport (375px)"
              >
                <Smartphone size={14} />
                <span className="hidden sm:inline">Mobile (375px)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setFullPreviewOpen(false)}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
              title="Close preview window"
            >
              <X size={20} />
            </button>
          </div>

          {/* Device Mockup Canvas */}
          <div className="flex-1 overflow-y-auto overflow-x-auto flex justify-center items-start p-2 sm:p-6 bg-slate-950/40 rounded-2xl border border-slate-800/60">
            <div
              className={`transition-all duration-300 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200/90 my-auto ${
                fullPreviewDevice === 'desktop'
                  ? 'w-full max-w-[1100px]'
                  : fullPreviewDevice === 'tablet'
                  ? 'w-[768px] max-w-full'
                  : 'w-[375px] max-w-full border-4 border-slate-800'
              }`}
            >
              {/* Browser Mockup Chrome Header */}
              <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-400 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
                </div>
                <div className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1 text-[11px] text-slate-500 font-mono flex items-center gap-1.5 truncate">
                  <span className="text-emerald-600 font-bold">🔒</span>
                  <span>https://heygoodly.com/preview-draft</span>
                </div>
              </div>

              {/* Rendered HTML Content */}
              <div className="p-6 sm:p-10 md:p-12 min-h-[500px]">
                <div
                  className="prose prose-slate max-w-none text-slate-800 leading-relaxed font-sans prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2 prose-p:my-3 prose-p:leading-relaxed prose-a:text-[#2b579a] prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-[#2b579a] prose-blockquote:italic prose-blockquote:pl-4 prose-blockquote:my-4 prose-img:rounded-xl prose-ul:list-disc prose-ol:list-decimal"
                  dangerouslySetInnerHTML={{ __html: value || editorRef.current?.innerHTML || '<p class="text-slate-400 italic">No content drafted yet...</p>' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
