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
} from 'lucide-react';
import MediaLibraryModal from './MediaLibraryModal';

export interface ArticleTocItem {
  id: string;
  level: 'h2' | 'h3' | 'h4';
  label: string;
}

export function extractTocFromHtml(html: string): ArticleTocItem[] {
  if (!html) return [];
  const items: ArticleTocItem[] = [];
  const regex = /<(h[2-4])([^>]*)>([\s\S]*?)<\/\1>/gi;
  let match;
  let index = 1;
  while ((match = regex.exec(html)) !== null) {
    const level = match[1].toLowerCase() as 'h2' | 'h3' | 'h4';
    const attrs = match[2];
    const rawText = match[3];
    const cleanLabel = rawText.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
    if (!cleanLabel) continue;

    const idMatch = attrs.match(/id=["']([^"']+)["']/i);
    const id = idMatch ? idMatch[1] : `section-${index++}`;
    items.push({ id, level, label: cleanLabel });
  }
  return items;
}

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
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
    category: 'Cấu trúc bài',
    name: 'Section Đánh Giá & Điểm Nổi Bật',
    description: 'Thẻ bài viết chuẩn với tiêu đề đỏ Crimson, thanh accent và đoạn văn phân tích chuyên sâu.',
    previewColor: 'bg-white border-slate-200 text-slate-800',
    badge: 'Phổ biến nhất',
    html: `<section class="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4 article-component my-6 relative">
  <div contenteditable="false" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(0,0,0,0.06); padding-bottom: 8px; margin-bottom: 12px; user-select: none;">
    <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; display: flex; align-items: center; gap: 6px;">
      <span style="width: 6px; height: 6px; border-radius: 9999px; background-color: #C62828;"></span>
      Thẻ Đánh Giá & Điểm Nổi Bật
    </span>
    <button type="button" class="box-delete-btn" style="background: #ffffff; color: #dc2626; border: 1px solid #fecaca; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; cursor: pointer;">
      🗑️ Xóa Thẻ
    </button>
  </div>
  <div class="flex items-center gap-3">
    <span class="w-1.5 h-6 bg-[#C62828] rounded-full"></span>
    <h2 class="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">1. Tổng Quan & Điểm Nổi Bật Sản Phẩm</h2>
  </div>
  <p class="text-slate-600 leading-relaxed">Mô tả chi tiết tổng quan về sản phẩm, công nghệ nổi bật và những trải nghiệm thực tế đầu tiên sau thời gian kiểm định tại phòng lab.</p>
  <p class="text-slate-600 leading-relaxed">Đội ngũ chuyên gia đã tiến hành đánh giá độ bền, khả năng vận hành thực tế và mức độ tương thích so với các đối thủ trong cùng phân khúc.</p>
</section>`,
  },
  {
    id: 'benchmark-section',
    category: 'Cấu trúc bài',
    name: 'Section Thử Nghiệm & Kết Quả Lab',
    description: 'Khung bài viết có hộp điểm số tổng hợp Lab Benchmark Summary 9.4/10 nổi bật.',
    previewColor: 'bg-white border-slate-200 text-slate-800',
    badge: 'Lab Benchmark',
    html: `<section class="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4 article-component my-6 relative">
  <div contenteditable="false" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(0,0,0,0.06); padding-bottom: 8px; margin-bottom: 12px; user-select: none;">
    <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; display: flex; align-items: center; gap: 6px;">
      <span style="width: 6px; height: 6px; border-radius: 9999px; background-color: #C62828;"></span>
      Thẻ Kết Quả Lab Benchmark
    </span>
    <button type="button" class="box-delete-btn" style="background: #ffffff; color: #dc2626; border: 1px solid #fecaca; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; cursor: pointer;">
      🗑️ Xóa Thẻ
    </button>
  </div>
  <div class="flex items-center gap-3">
    <span class="w-1.5 h-6 bg-[#C62828] rounded-full"></span>
    <h2 class="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">2. Hiệu Năng Thực Tế & Kết Quả Kiểm Nghiệm</h2>
  </div>
  <p class="text-slate-600 leading-relaxed">Trong điều kiện kiểm thử tiêu chuẩn, thiết bị cho thấy khả năng duy trì hiệu suất ổn định và độ tin cậy vượt trội.</p>
  <div class="bg-slate-50 border-l-4 border-[#C62828] p-4 rounded-r-xl space-y-1">
    <p class="font-bold text-slate-900 text-sm">Lab Benchmark Summary: 9.4 / 10</p>
    <p class="text-xs text-slate-600 leading-relaxed">Composite testing score across build precision, acoustic/thermal dissipation, and everyday ergonomic comfort.</p>
  </div>
</section>`,
  },
  {
    id: 'deal-promo-box',
    category: 'Khuyến mãi & Deal',
    name: 'Section Deal Độc Quyền & Voucher',
    description: 'Khung deal gradient viền nét đứt đỏ, hiển thị giá ưu đãi, mã coupon copy và nút Claim Deal.',
    previewColor: 'bg-rose-50/50 border-rose-300 text-rose-950',
    badge: 'Chuyển đổi cao',
    html: `<div class="editorial-box my-6 rounded-2xl border-2 border-dashed border-[#C62828] bg-gradient-to-br from-red-50 via-white to-orange-50 p-6 sm:p-7 shadow-xs relative overflow-hidden article-component" data-box-type="deal">
  <div contenteditable="false" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; user-select: none;">
    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase bg-[#C62828] text-white shadow-xs">
      EXCLUSIVE DEAL - TIẾT KIỆM 45%
    </span>
    <div style="display: flex; align-items: center; gap: 8px;">
      <span class="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-md">Mã đã xác thực hôm nay</span>
      <button type="button" class="box-delete-btn" style="background: #ffffff; color: #dc2626; border: 1px solid #fecaca; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; cursor: pointer;">
        🗑️ Xóa Deal Box
      </button>
    </div>
  </div>
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div class="space-y-1.5">
      <h3 class="deal-title text-lg sm:text-xl font-black text-slate-950">Ưu Đãi Đặc Biệt Dành Riêng Cho Độc Giả</h3>
      <p class="text-xs sm:text-sm text-slate-600">Áp dụng mã giảm giá độc quyền để nhận ngay chiết khấu trực tiếp tại trang thanh toán chính hãng.</p>
      <div class="flex items-baseline gap-2 pt-1">
        <span class="deal-price text-2xl sm:text-3xl font-black text-[#C62828]">$49.99</span>
        <span class="deal-original-price text-sm text-slate-400 line-through">$89.99</span>
        <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Giảm $40</span>
      </div>
    </div>
    <div class="flex flex-col items-start md:items-end gap-2 shrink-0">
      <div class="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs shadow-xs">
        <span class="text-slate-500 font-medium">Mã Coupon:</span>
        <span class="deal-code font-mono font-black text-red-600 tracking-wider">BARGORYA20</span>
      </div>
      <a href="https://example.com/deal" target="_blank" rel="noopener noreferrer nofollow" class="deal-button inline-flex items-center gap-2 bg-[#C62828] hover:bg-[#B71C1C] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow transition">
        Claim Deal Tại Store Chính Hãng →
      </a>
    </div>
  </div>
</div>`,
  },
  {
    id: 'pros-cons-grid',
    category: 'Đánh giá & So sánh',
    name: 'Bảng So Sánh Ưu Điểm & Nhược Điểm',
    description: 'Grid 2 cột tương phản: Cột xanh lá hiển thị ưu điểm, cột hồng hiển thị điểm cần lưu ý.',
    previewColor: 'bg-emerald-50/50 border-emerald-200 text-emerald-950',
    badge: 'So sánh',
    html: `<div class="editorial-box my-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs article-component relative" data-box-type="pros-cons">
  <div contenteditable="false" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; user-select: none;">
    <h3 class="text-base font-black text-slate-900 flex items-center gap-2" style="margin: 0;">
      <span class="text-[#C62828]">⚖️</span> Bảng Đánh Giá Ưu Điểm & Nhược Điểm
    </h3>
    <button type="button" class="box-delete-btn" style="background: #ffffff; color: #dc2626; border: 1px solid #fecaca; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; cursor: pointer;">
      🗑️ Xóa Bảng
    </button>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-2">
      <h4 class="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
        <span>✓</span> ƯU ĐIỂM NỔI BẬT
      </h4>
      <ul class="text-xs text-slate-700 space-y-1.5 list-disc pl-4 leading-relaxed">
        <li>Chất lượng gia công cứng cáp, tiêu chuẩn chống bụi/nước cao</li>
        <li>Tương thích tốt với hầu hết các dòng xe phổ biến</li>
        <li>Bảo hành chính hãng 24 tháng kèm hỗ trợ kỹ thuật trọn đời</li>
      </ul>
    </div>
    <div class="bg-rose-50/60 border border-rose-200 rounded-xl p-4 space-y-2">
      <h4 class="text-xs font-black uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
        <span>✕</span> ĐIỂM CẦN LƯU Ý
      </h4>
      <ul class="text-xs text-slate-700 space-y-1.5 list-disc pl-4 leading-relaxed">
        <li>Cần có dụng cụ chuyên dụng cơ bản để lắp đặt tối ưu</li>
        <li>Số lượng mã giảm giá độc quyền có giới hạn mỗi ngày</li>
      </ul>
    </div>
  </div>
</div>`,
  },
  {
    id: 'verdict-dark-box',
    category: 'Cấu trúc bài',
    name: 'Section Kết Luận Đen Sang Trọng (Verdict)',
    description: 'Thẻ đen huyền bí (Slate-900) với huy hiệu Editor’s Choice và điểm số lớn màu vàng.',
    previewColor: 'bg-slate-900 border-slate-800 text-white',
    badge: 'Editor’s Choice',
    html: `<section class="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md space-y-4 article-component my-6 relative" style="background-color: #0f172a; color: #ffffff;">
  <div contenteditable="false" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 8px; margin-bottom: 8px; user-select: none;">
    <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; display: flex; align-items: center; gap: 6px;">
      <span style="width: 6px; height: 6px; border-radius: 9999px; background-color: #f59e0b;"></span>
      Thẻ Kết Luận Editorial Verdict
    </span>
    <button type="button" class="box-delete-btn" style="background: #1e293b; color: #f87171; border: 1px solid #334155; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; cursor: pointer;">
      🗑️ Xóa Thẻ
    </button>
  </div>
  <div class="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
    <h3 class="text-lg font-black tracking-tight text-white flex items-center gap-2">
      <span>🏆</span> KẾT LUẬN CỦA BAN BIÊN TẬP
    </h3>
    <span class="text-xs font-bold bg-[#C62828] text-white px-3 py-1 rounded-full">Khuyên Dùng (Editor's Choice)</span>
  </div>
  <p class="text-slate-300 text-sm leading-relaxed">Nếu bạn đang tìm kiếm sự cân bằng hoàn hảo giữa hiệu năng ổn định và chi phí đầu tư hợp lý, đây chắc chắn là một trong những giải pháp tốt nhất ở thời điểm hiện tại.</p>
  <div class="flex items-center gap-4 pt-2">
    <div class="text-3xl sm:text-4xl font-black text-amber-400">9.6 / 10</div>
    <div class="text-xs text-slate-400">Được bình chọn bởi ban chuyên môn và cộng đồng người dùng thực tế.</div>
  </div>
</section>`,
  },
  {
    id: 'full-media-figure',
    category: 'Hình ảnh & Media',
    name: 'Khung Ảnh Minh Họa Có Chú Thích',
    description: 'Khung ảnh toàn màn hình với bo góc 2xl, hiệu ứng viền tinh tế và chú thích canh giữa.',
    previewColor: 'bg-slate-100 border-slate-300 text-slate-700',
    badge: 'Hình ảnh',
    html: `<figure class="my-6 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 article-component relative" data-box-type="image">
  <div contenteditable="false" style="position: absolute; top: 10px; right: 10px; z-index: 10; user-select: none;">
    <button type="button" class="box-delete-btn" style="background: rgba(0,0,0,0.75); color: #ffffff; border: 1px solid rgba(255,255,255,0.2); font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 6px; cursor: pointer; backdrop-filter: blur(4px);">
      🗑️ Xóa Ảnh
    </button>
  </div>
  <img src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&auto=format&fit=crop&q=80" alt="Minh họa sản phẩm thực tế" class="w-full h-auto object-cover max-h-[460px]" />
  <figcaption class="p-3 text-center text-xs text-slate-500 italic border-t border-slate-100 bg-white">
    Hình ảnh thực tế sản phẩm được kiểm nghiệm trong điều kiện ánh sáng tự nhiên
  </figcaption>
</figure>`,
  },
  {
    id: 'split-media-text',
    category: 'Hình ảnh & Media',
    name: 'Khung 2 Cột: Ảnh Bên Trái + Mô Tả Bên Phải',
    description: 'Bố cục hiện đại 2 cột cân xứng: Ảnh chụp cận cảnh bên trái kết hợp bài viết thuyết minh bên phải.',
    previewColor: 'bg-white border-slate-200 text-slate-800',
    badge: 'Media + Text',
    html: `<section class="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs article-component my-6 relative">
  <div contenteditable="false" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(0,0,0,0.06); padding-bottom: 8px; margin-bottom: 12px; user-select: none;">
    <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; display: flex; align-items: center; gap: 6px;">
      <span style="width: 6px; height: 6px; border-radius: 9999px; background-color: #C62828;"></span>
      Khung Media 2 Cột
    </span>
    <button type="button" class="box-delete-btn" style="background: #ffffff; color: #dc2626; border: 1px solid #fecaca; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; cursor: pointer;">
      🗑️ Xóa Thẻ
    </button>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
    <div class="rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
      <img src="https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80" alt="Chi tiết tính năng sản phẩm" class="w-full h-auto object-cover" />
    </div>
    <div class="space-y-3">
      <span class="text-xs font-bold uppercase tracking-wider text-[#C62828]">Chi Tiết Thiết Kế</span>
      <h3 class="text-xl font-black text-slate-950">Gia Công Tinh Xảo Đến Từng Chi Tiết</h3>
      <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">Vật liệu cấu tạo đạt chứng chỉ quốc tế về độ bền, hoàn thiện tỉ mỉ và đem lại cảm giác sử dụng đầm chắc, tin cậy.</p>
    </div>
  </div>
</section>`,
  },
  {
    id: 'cta-action-banner',
    category: 'Khuyến mãi & Deal',
    name: 'Banner Kêu Gọi Mua Hàng Nhanh (CTA)',
    description: 'Banner ngang tối màu sang trọng kích thích người dùng click chuyển hướng mua ngay.',
    previewColor: 'bg-slate-900 border-slate-800 text-white',
    badge: 'Kêu gọi CTA',
    html: `<div class="editorial-box my-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-6 sm:p-7 shadow-lg article-component relative" data-box-type="banner">
  <div contenteditable="false" style="display: flex; align-items: center; justify-content: flex-end; margin-bottom: 8px; user-select: none;">
    <button type="button" class="box-delete-btn" style="background: rgba(255,255,255,0.1); color: #f87171; border: 1px solid rgba(255,255,255,0.15); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; cursor: pointer;">
      🗑️ Xóa Banner
    </button>
  </div>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
    <div class="space-y-1 text-center sm:text-left">
      <h3 class="text-base sm:text-lg font-black text-white">Bạn Đã Sẵn Sàng Trải Nghiệm?</h3>
      <p class="text-xs text-slate-300">Đặt hàng ngay hôm nay để nhận ưu đãi miễn phí vận chuyển toàn quốc và bảo hành chính hãng 24 tháng.</p>
    </div>
    <a href="https://example.com/buy" target="_blank" rel="noopener noreferrer nofollow" class="cta-button shrink-0 inline-flex items-center gap-2 bg-[#C62828] hover:bg-[#B71C1C] text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md transition">
      Mua Ngay Với Giá Ưu Đãi →
    </a>
  </div>
</div>`,
  },
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write or paste your article review content here... Use the toolbar above for headings, images, quotes, and product test tables.',
  minHeight = '360px',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceCode, setSourceCode] = useState(value);
  
  // Modals state
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageAlign, setImageAlign] = useState<'center' | 'full' | 'left' | 'right'>('center');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Deal Box modal state (đổi link các button, đổi giá, coupon)
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [editingBoxEl, setEditingBoxEl] = useState<HTMLElement | null>(null);
  const [dealForm, setDealForm] = useState({
    title: 'Nilight 20-Inch Curved Dual-Row LED Light Bar',
    originalPrice: '$89.99',
    dealPrice: '$49.99',
    couponCode: 'BARGORYA20',
    badge: 'Verified Exclusive Deal',
    description: 'Use code BARGORYA20 at checkout for an extra 20% off.',
    buttonText: 'Claim Deal at Official Store →',
    buttonUrl: 'https://www.nilight.com/?ref=bargorya',
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

  // Table of Contents state (closed by default to maximize editing space)
  const [tocOpen, setTocOpen] = useState(false);
  const [tocList, setTocList] = useState<ArticleTocItem[]>(() => extractTocFromHtml(value || ''));

  // Calculate active component position for floating toolbar
  const syncActiveCompRect = (comp: HTMLElement | null = activeComp) => {
    if (!comp || !editorRef.current) {
      setActiveCompRect(null);
      return;
    }
    const editorWrapper = editorRef.current.parentElement;
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
    setTocList(extractTocFromHtml(html));
  };

  // Scroll to heading and highlight it in editor
  const scrollToHeading = (label: string, index: number) => {
    if (!editorRef.current) return;
    const headings = Array.from(editorRef.current.querySelectorAll('h2, h3, h4'));
    const target = headings.find((h) => h.textContent?.trim() === label) || headings[index];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('ring-2', 'ring-[#C62828]', 'bg-rose-50/70', 'transition-all', 'duration-500');
      setTimeout(() => {
        target.classList.remove('ring-2', 'ring-[#C62828]', 'bg-rose-50/70', 'transition-all', 'duration-500');
      }, 1800);

      const comp = findEnclosingComponent(target);
      selectComponent(comp || (target as HTMLElement));
    }
  };

  // Insert structured Table of Contents box into article content
  const insertTocBox = () => {
    const currentToc = extractTocFromHtml(editorRef.current?.innerHTML || value || '');
    if (currentToc.length === 0) {
      alert('Chưa có tiêu đề H2/H3 nào để tạo mục lục. Vui lòng thêm tiêu đề H2 bằng thanh công cụ hoặc bấm "+ Thêm Component" trước.');
      return;
    }
    const itemsHtml = currentToc
      .map((item, idx) => {
        const numMatch = item.label.match(/^(\d+)[\.\s]/);
        const sectionNum = numMatch ? numMatch[1].padStart(2, '0') : (idx + 1).toString().padStart(2, '0');
        const cleanTitle = numMatch ? item.label.replace(/^\d+[\.\s]+/, '') : item.label;
        const isH2 = item.level === 'h2';

        return `
          <a href="#${item.id}" style="display: flex; align-items: center; gap: 10px; padding: 9px 12px; background: ${isH2 ? '#ffffff' : '#f8fafc'}; border: 1px solid ${isH2 ? '#e2e8f0' : 'transparent'}; border-radius: 10px; text-decoration: none; color: #1e293b; font-size: 13px; font-weight: ${isH2 ? '700' : '500'}; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <span style="width: 22px; height: 22px; border-radius: 6px; background: ${isH2 ? '#fee2e2' : '#f1f5f9'}; color: ${isH2 ? '#C62828' : '#64748b'}; font-family: monospace; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; shrink-0;">${sectionNum}</span>
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">${cleanTitle}</span>
            <span style="color: #cbd5e1; font-size: 12px;">→</span>
          </a>
        `;
      })
      .join('');

    const tocHtml = `
      <nav class="editorial-box my-6 rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50 via-white to-slate-50/60 p-5 sm:p-6 shadow-2xs article-component relative" data-box-type="toc">
        <div contenteditable="false" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 14px; user-select: none;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 10px; background: #fee2e2; border: 1px solid #fecaca; display: flex; align-items: center; justify-content: center; font-size: 15px;">
              📑
            </div>
            <div>
              <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #0f172a;">Mục Lục Bài Viết (Table of Contents)</div>
              <div style="font-size: 11px; color: #64748b;">Bấm đề mục để chuyển nhanh đến nội dung</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 11px; font-weight: 700; color: #64748b; background: #ffffff; padding: 3px 9px; border-radius: 6px; border: 1px solid #e2e8f0;">${currentToc.length} đề mục</span>
            <button type="button" class="box-delete-btn" style="background: #ffffff; color: #dc2626; border: 1px solid #fecaca; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 6px; cursor: pointer;">
              🗑️ Xóa Mục Lục
            </button>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${itemsHtml}
        </div>
      </nav>
    `;
    insertCustomHTML(tocHtml);
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
    document.execCommand(command, false, val);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const applyFormatBlock = (tag: string) => {
    exec('formatBlock', tag);
  };

  const insertCustomHTML = (html: string) => {
    if (isSourceMode) {
      setSourceCode((prev) => prev + html);
      onChange(sourceCode + html);
      return;
    }
    exec('insertHTML', html);
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
      if (boxType === 'deal') return 'Deal Box Khuyến Mãi';
      if (boxType === 'tip') return 'Tip Box Thử Nghiệm';
      if (boxType === 'warning') return 'Warning Box Cảnh Báo';
      if (boxType === 'verdict') return 'Verdict Box Kết Luận';
      if (boxType === 'pros-cons') return 'Bảng Ưu & Nhược Điểm';
      if (boxType === 'button') return 'Button CTA Mua Hàng';
      if (boxType === 'image') return 'Khung Ảnh Minh Họa';
      if (boxType === 'toc') return 'Khung Mục Lục (TOC)';
    }
    if (el.tagName.toLowerCase() === 'figure') return 'Khung Ảnh Minh Họa';
    if (el.tagName.toLowerCase() === 'section') return 'Thẻ Section Bài Viết';
    return 'Thẻ / Component Bài Viết';
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
    if (activeComp && editorRef.current && editorRef.current.contains(activeComp)) {
      const temp = document.createElement('div');
      temp.innerHTML = templateHTML.trim();
      const newEl = temp.firstElementChild as HTMLElement;
      if (newEl) {
        activeComp.after(newEl);
        selectComponent(newEl);
        handleInput();
        newEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } else {
      insertCustomHTML(templateHTML);
    }
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
      alert('Vui lòng click chọn một thẻ bài viết hoặc component bên trong nội dung để xóa.');
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
          const formData = new FormData();
          formData.append('file', file);
          formData.append('folder', 'article-content');
          const res = await fetch('/api/upload', { method: 'POST', body: formData });
          if (res.ok) {
            const data = await res.json();
            if (data.url) {
              insertImageHTML(data.url, file.name.replace(/\.[^/.]+$/, ''));
              setIsUploadingImage(false);
              return;
            }
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
            ✕ Xóa ảnh
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
              ✕ Xóa Tip Box
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
              ✕ Xóa Warning Box
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
              ✕ Xóa Verdict Box
            </button>
          </div>
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #C62828; font-weight: 700; margin-bottom: 6px;">Bargorya Lab Score: 9.4 / 10</div>
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
            ✕ Xóa Bảng Pros/Cons
          </button>
        </div>
        <div style="background: #f0fdf4; border-radius: 12px; padding: 16px; border: 1px solid #bbf7d0;">
          <strong style="color: #166534; font-size: 14px; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
            ✓ Ưu điểm vượt trội (Pros)
          </strong>
          <ul style="margin: 0; padding-left: 20px; color: #15803d; font-size: 13px; line-height: 1.6;">
            <li>Độ hoàn thiện cao cấp, cảm giác cầm đầm tay.</li>
            <li>Độ sáng và hiệu năng vượt trội trong tầm giá.</li>
            <li>Có bảo hành chính hãng và hỗ trợ đổi trả nhanh.</li>
          </ul>
        </div>
        <div style="background: #fef2f2; border-radius: 12px; padding: 16px; border: 1px solid #fecaca;">
          <strong style="color: #991b1b; font-size: 14px; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
            ✕ Nhược điểm cần cân nhắc (Cons)
          </strong>
          <ul style="margin: 0; padding-left: 20px; color: #7f1d1d; font-size: 13px; line-height: 1.6;">
            <li>Giá thành nhỉnh hơn một số đối thủ cùng phân khúc.</li>
            <li>Hộp sản phẩm không đi kèm phụ kiện mở rộng.</li>
          </ul>
        </div>
      </div>
    `;
    insertCustomHTML(prosConsHTML);
  };

  // Save Deal Box (Create new or update existing)
  const handleSaveDealBox = () => {
    let btnBg = '#C62828';
    if (dealForm.buttonStyle === 'emerald') btnBg = '#059669';
    if (dealForm.buttonStyle === 'dark') btnBg = '#171717';

    const finalBoxHTML = `
      <div class="editorial-box my-6 border-2 border-[#C62828] bg-white rounded-2xl p-6 shadow-sm relative" data-box-type="deal" style="border: 2px solid #C62828; background-color: #ffffff; padding: 22px; border-radius: 16px; margin: 24px 0;">
        <div contenteditable="false" style="display: flex; justify-content: flex-end; gap: 6px; margin-bottom: 12px; user-select: none;">
          <button type="button" class="box-edit-deal-btn" style="background: #f1f5f9; color: #334155; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 6px; border: 1px solid #cbd5e1; cursor: pointer;">
            ✏️ Đổi Link Button & Giá
          </button>
          <button type="button" class="box-delete-btn" style="background: #fef2f2; color: #dc2626; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 6px; border: 1px solid #fecaca; cursor: pointer;">
            ✕ Xóa Deal Box
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
        <p style="margin: 0 0 16px 0; font-size: 13px; color: #52525b;">${dealForm.description} Mã voucher: <strong class="deal-code" style="color: #C62828; background: #fef2f2; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${dealForm.couponCode}</strong></p>
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
    let btnStyle = 'background-color: #C62828; color: #ffffff; border: none;';
    if (buttonForm.style === 'emerald') btnStyle = 'background-color: #059669; color: #ffffff; border: none;';
    if (buttonForm.style === 'dark') btnStyle = 'background-color: #171717; color: #ffffff; border: none;';
    if (buttonForm.style === 'outline') btnStyle = 'background-color: transparent; color: #C62828; border: 2px solid #C62828;';

    const alignStyle = buttonForm.alignment === 'center' ? 'text-align: center; margin: 20px auto;' : 'text-align: left; margin: 20px 0;';

    const btnHTML = `
      <div class="editorial-box my-4" data-box-type="button" style="${alignStyle}">
        <div contenteditable="false" style="display: inline-block; margin-bottom: 4px; user-select: none;">
          <button type="button" class="box-delete-btn" style="background: #f1f5f9; color: #dc2626; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1; cursor: pointer; margin-right: 6px;">
            ✕ Xóa Button
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

  // Insert Link
  const handleInsertLink = () => {
    if (!linkUrl.trim()) return;
    const finalUrl = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
    if (linkText.trim()) {
      insertCustomHTML(`<a href="${finalUrl}" target="_blank" rel="noopener noreferrer" style="color: #C62828; text-decoration: underline; font-weight: 600;">${linkText}</a>`);
    } else {
      exec('createLink', finalUrl);
    }
    setLinkUrl('');
    setLinkText('');
    setLinkModalOpen(false);
  };

  // Upload image file from modal
  const handleModalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploadingImage(true);
      setUploadProgress(25);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'article-content');

        setUploadProgress(50);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        setUploadProgress(85);
        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            setImageUrl(data.url);
            setIsUploadingImage(false);
            setUploadProgress(100);
            return;
          }
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
    insertImageHTML(imageUrl, imageCaption, imageAlign);
    setImageUrl('');
    setImageCaption('');
    setImageModalOpen(false);
  };

  // Typography font size change
  const handleFontSizeChange = (size: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.fontSize = size;
    try {
      range.surroundContents(span);
    } catch (e) {
      document.execCommand('insertHTML', false, `<span style="font-size: ${size}">${selection.toString()}</span>`);
    }
    handleInput();
  };

  // Typography color change
  const handleColorChange = (color: string) => {
    exec('foreColor', color);
    setColorMenuOpen(false);
  };

  // Typography highlight change
  const handleHighlightChange = (color: string) => {
    exec('hiliteColor', color);
    setHighlightMenuOpen(false);
  };

  // Toggle Serif font on selection
  const handleToggleSerif = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.fontFamily = 'var(--font-serif), Georgia, serif';
    span.className = 'font-editorial';
    try {
      range.surroundContents(span);
    } catch (e) {
      document.execCommand('insertHTML', false, `<span style="font-family: var(--font-serif), Georgia, serif;">${selection.toString()}</span>`);
    }
    handleInput();
  };

  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm p-2 sm:p-5 flex flex-col justify-center items-center animate-fadeIn'
          : 'border border-slate-200 rounded-2xl bg-white shadow-2xs overflow-hidden flex flex-col w-full'
      }
    >
      <div
        className={
          isFullscreen
            ? 'w-full h-full max-w-[1600px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden'
            : 'flex flex-col w-full'
        }
      >
      
      {/* =========================================================================
          TOOLBAR ROW 1: CHÈN KHỐI, TEMPLATES, HỘP BIÊN TẬP, ẢNH & MEDIA (ENTERPRISE BAR)
         ========================================================================= */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-2 text-xs text-slate-700 select-none overflow-x-auto whitespace-nowrap scrollbar-none">
        
        {/* + THÊM COMPONENT / SECTION MỚI (PRIMARY MODAL) */}
        <button
          type="button"
          onClick={() => setAddCompModalOpen(true)}
          className="h-7.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition cursor-pointer flex items-center gap-1.5 font-bold shadow-xs whitespace-nowrap shrink-0"
          title="Thư viện component & section mẫu cho bài viết"
        >
          <PlusCircle size={14} />
          <span>+ Thêm Component</span>
        </button>

        {/* DROPDOWN: HỘP MẪU BIÊN TẬP (TIP, WARNING, VERDICT, PROS/CONS) */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => {
              setPresetBoxesOpen(!presetBoxesOpen);
              setColorMenuOpen(false);
              setHighlightMenuOpen(false);
            }}
            className={`h-7.5 px-2.5 rounded-lg border font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 ${
              presetBoxesOpen
                ? 'bg-slate-200 border-slate-300 text-slate-900 shadow-inner'
                : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-800 shadow-2xs'
            }`}
            title="Chèn các hộp bài viết mẫu (Tip, Cảnh báo, Kết luận, Ưu nhược điểm)"
          >
            <LayoutGrid size={13} className="text-indigo-600" />
            <span>+ Hộp Mẫu Biên Tập</span>
            <ChevronDown size={12} className="text-slate-400" />
          </button>

          {presetBoxesOpen && (
            <div className="absolute top-full left-0 mt-1.5 z-40 bg-white border border-slate-200 rounded-2xl p-2 shadow-2xl w-72 space-y-1 animate-fadeIn">
              <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                Chọn kiểu hộp muốn chèn:
              </div>
              <button
                type="button"
                onClick={() => {
                  insertCallout('tip');
                  setPresetBoxesOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 hover:bg-emerald-50 rounded-xl transition flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Lightbulb size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950 group-hover:text-emerald-700">Tip Box Thử Nghiệm</div>
                  <div className="text-[10px] text-slate-500">Mẹo kinh nghiệm & bí quyết test</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  insertCallout('warning');
                  setPresetBoxesOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 hover:bg-rose-50 rounded-xl transition flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <AlertTriangle size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-rose-950 group-hover:text-rose-700">Warning Box Cảnh Báo</div>
                  <div className="text-[10px] text-slate-500">Cảnh báo lỗi, hàng giả hoặc lưu ý kỹ thuật</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  insertCallout('verdict');
                  setPresetBoxesOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 hover:bg-slate-100 rounded-xl transition flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center shrink-0">
                  <Trophy size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-950 group-hover:text-slate-700">Verdict Box Kết Luận</div>
                  <div className="text-[10px] text-slate-500">Đánh giá chung kết & điểm số phòng Lab</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  insertProsCons();
                  setPresetBoxesOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 hover:bg-teal-50 rounded-xl transition flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <Scale size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-teal-950 group-hover:text-teal-700">Bảng So Sánh Pros / Cons</div>
                  <div className="text-[10px] text-slate-500">Grid 2 cột tương phản Ưu & Nhược điểm</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* + DEAL BOX (BUTTON ĐỎ ĐẶC TRƯNG) */}
        <button
          type="button"
          onClick={() => {
            setEditingBoxEl(null);
            setDealModalOpen(true);
          }}
          className="h-7.5 px-3 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-lg transition cursor-pointer flex items-center gap-1.5 font-bold shadow-2xs whitespace-nowrap shrink-0"
          title="Chèn Deal Box & Cấu hình Link Nút Mua Hàng"
        >
          <Tag size={13} />
          <span>+ Deal Box</span>
        </button>

        <div className="h-4 w-px bg-slate-300 shrink-0 mx-0.5" />

        {/* MEDIA & LINKS */}
        <button
          type="button"
          onClick={() => setImageModalOpen(true)}
          className="h-7.5 px-2.5 bg-white border border-slate-200 hover:bg-rose-50 text-[#C62828] rounded-lg transition cursor-pointer flex items-center gap-1.5 font-bold shadow-2xs whitespace-nowrap shrink-0"
          title="Tải ảnh lên và chèn vào bài viết"
        >
          <ImageIcon size={14} />
          <span>Upload Ảnh</span>
        </button>

        <button
          type="button"
          onClick={() => setMediaLibraryOpen(true)}
          className="h-7.5 px-2.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-lg transition cursor-pointer flex items-center gap-1.5 font-bold shadow-2xs whitespace-nowrap shrink-0"
          title="Chọn ảnh từ Thư viện Media dùng chung"
        >
          <FolderOpen size={14} />
          <span>Thư viện Media</span>
        </button>

        <button
          type="button"
          onClick={() => setLinkModalOpen(true)}
          className="h-7.5 px-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg transition cursor-pointer flex items-center gap-1.5 font-semibold shadow-2xs whitespace-nowrap shrink-0"
          title="Chèn hoặc đổi link liên kết"
        >
          <LinkIcon size={13} className="text-[#C62828]" />
          <span>Chèn Link</span>
        </button>

        <button
          type="button"
          onClick={() => setButtonModalOpen(true)}
          className="h-7.5 px-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-lg transition cursor-pointer flex items-center gap-1.5 font-bold shadow-2xs whitespace-nowrap shrink-0"
          title="Chèn nút bấm Button CTA liên kết mua hàng"
        >
          <MousePointerClick size={14} className="text-[#C62828]" />
          <span>+ Button CTA</span>
        </button>

        <div className="h-4 w-px bg-slate-300 shrink-0 mx-0.5" />

        {/* MỤC LỤC TOC TOGGLE */}
        <button
          type="button"
          onClick={() => setTocOpen(!tocOpen)}
          className={`h-7.5 px-2.5 rounded-lg border font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 ${
            tocOpen
              ? 'bg-rose-50 text-[#C62828] border-rose-200'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
          title="Bật/Tắt thanh mục lục Table of Contents"
        >
          <ListTree size={13} className={tocOpen ? 'text-[#C62828]' : 'text-slate-500'} />
          <span>Mục Lục TOC ({tocList.length})</span>
        </button>

        {/* XÓA KHUNG / COMPONENT */}
        <button
          type="button"
          onClick={deleteActiveBox}
          className="h-7.5 px-2.5 bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
          title="Xóa component hoặc box đang chọn"
        >
          <Trash2 size={13} />
          <span>Xóa Box / Thẻ</span>
        </button>

        {/* VIEW MODE & FULLSCREEN 100% TOGGLE */}
        <div className="ml-auto shrink-0 pl-2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`h-7.5 px-2.5 rounded-lg font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs ${
              isFullscreen
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title={isFullscreen ? 'Thu nhỏ về khung form' : 'Phóng to 100% toàn màn hình'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 size={13} />
                <span>Thu Nhỏ</span>
              </>
            ) : (
              <>
                <Maximize2 size={13} />
                <span>⛶ 100% Toàn Màn Hình</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsSourceMode(!isSourceMode)}
            className={`h-7.5 px-3 rounded-lg font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              isSourceMode
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {isSourceMode ? (
              <>
                <Eye size={13} />
                <span>Visual Mode</span>
              </>
            ) : (
              <>
                <Code2 size={13} />
                <span>HTML Code</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* =========================================================================
          TOOLBAR ROW 2: TYPOGRAPHY, FONT SIZE, COLOR, ALIGNMENT & LISTS
         ========================================================================= */}
      <div className="bg-slate-100/80 border-b border-slate-200 px-3 py-1.5 flex items-center gap-1.5 text-xs text-slate-700 select-none overflow-x-auto whitespace-nowrap scrollbar-none">
        
        {/* Headings */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 shrink-0">
          <button
            type="button"
            onClick={() => applyFormatBlock('<p>')}
            className="p-1.5 hover:bg-slate-200 rounded text-xs font-semibold px-2 transition cursor-pointer"
            title="Normal Paragraph"
          >
            P
          </button>
          <button
            type="button"
            onClick={() => applyFormatBlock('<h2>')}
            className="p-1.5 hover:bg-slate-200 rounded text-xs font-extrabold flex items-center gap-0.5 transition cursor-pointer"
            title="Heading 2 (H2)"
          >
            <Heading2 size={15} />
          </button>
          <button
            type="button"
            onClick={() => applyFormatBlock('<h3>')}
            className="p-1.5 hover:bg-slate-200 rounded text-xs font-extrabold flex items-center gap-0.5 transition cursor-pointer"
            title="Heading 3 (H3)"
          >
            <Heading3 size={15} />
          </button>
          <button
            type="button"
            onClick={() => applyFormatBlock('<h4>')}
            className="p-1.5 hover:bg-slate-200 rounded text-xs font-bold transition cursor-pointer"
            title="Heading 4 (H4)"
          >
            <Heading4 size={15} />
          </button>
        </div>

        {/* FONT SIZE DROPDOWN */}
        <div className="flex items-center gap-1 border-r border-slate-200 pr-1.5 shrink-0">
          <Type size={14} className="text-slate-400 shrink-0 ml-1" />
          <select
            onChange={(e) => {
              if (e.target.value) handleFontSizeChange(e.target.value);
            }}
            defaultValue="15px"
            className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium focus:outline-none focus:border-[#C62828] cursor-pointer"
            title="Đổi cỡ chữ đang chọn"
          >
            {FONT_SIZES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Inline Formatting */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 shrink-0">
          <button
            type="button"
            onClick={() => exec('bold')}
            className="p-1.5 hover:bg-slate-200 rounded transition cursor-pointer"
            title="Bold (Ctrl+B)"
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            onClick={() => exec('italic')}
            className="p-1.5 hover:bg-slate-200 rounded transition cursor-pointer"
            title="Italic (Ctrl+I)"
          >
            <Italic size={15} />
          </button>
          <button
            type="button"
            onClick={() => exec('underline')}
            className="p-1.5 hover:bg-slate-200 rounded transition cursor-pointer"
            title="Underline (Ctrl+U)"
          >
            <Underline size={15} />
          </button>
          <button
            type="button"
            onClick={() => exec('strikeThrough')}
            className="p-1.5 hover:bg-slate-200 rounded transition cursor-pointer"
            title="Strikethrough"
          >
            <Strikethrough size={15} />
          </button>
        </div>

        {/* TEXT COLOR PALETTE */}
        <div className="relative border-r border-slate-200 pr-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setColorMenuOpen(!colorMenuOpen);
              setHighlightMenuOpen(false);
              setPresetBoxesOpen(false);
            }}
            className="p-1.5 hover:bg-slate-200 rounded transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
            title="Đổi màu chữ (Text Color)"
          >
            <Palette size={15} className="text-[#C62828]" />
            <span className="hidden sm:inline">Màu chữ</span>
          </button>

          {colorMenuOpen && (
            <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-slate-200 rounded-xl p-2 shadow-xl grid grid-cols-4 gap-1.5 w-44 animate-fadeIn">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => handleColorChange(c.value)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 hover:scale-110 transition shadow-2xs"
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          )}
        </div>

        {/* HIGHLIGHT COLOR PALETTE */}
        <div className="relative border-r border-slate-200 pr-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setHighlightMenuOpen(!highlightMenuOpen);
              setColorMenuOpen(false);
              setPresetBoxesOpen(false);
            }}
            className="p-1.5 hover:bg-slate-200 rounded transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
            title="Tô sáng chữ (Highlight Text)"
          >
            <Highlighter size={15} className="text-amber-500" />
            <span className="hidden sm:inline">Highlight</span>
          </button>

          {highlightMenuOpen && (
            <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-slate-200 rounded-xl p-2 shadow-xl grid grid-cols-3 gap-1.5 w-48 animate-fadeIn">
              {HIGHLIGHT_COLORS.map((h) => (
                <button
                  key={h.value}
                  type="button"
                  onClick={() => handleHighlightChange(h.value)}
                  className="h-7 px-2 text-[10px] font-bold rounded-lg border border-slate-200 hover:scale-105 transition truncate"
                  style={{ backgroundColor: h.value === 'transparent' ? '#ffffff' : h.value }}
                  title={h.label}
                >
                  {h.label.split(' ')[0]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* FONT SERIF TOGGLE */}
        <div className="border-r border-slate-200 pr-1.5 shrink-0">
          <button
            type="button"
            onClick={handleToggleSerif}
            className="p-1.5 hover:bg-slate-200 rounded transition cursor-pointer text-xs font-serif italic font-bold px-2"
            title="Đổi font chữ đang chọn sang phong cách Editorial Serif"
          >
            Serif Font
          </button>
        </div>

        {/* TEXT ALIGNMENTS */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 shrink-0">
          <button
            type="button"
            onClick={() => exec('justifyLeft')}
            className="p-1.5 hover:bg-slate-200 rounded transition cursor-pointer"
            title="Canh lề trái"
          >
            <AlignLeft size={15} />
          </button>
          <button
            type="button"
            onClick={() => exec('justifyCenter')}
            className="p-1.5 hover:bg-slate-200 rounded transition cursor-pointer"
            title="Canh giữa"
          >
            <AlignCenter size={15} />
          </button>
          <button
            type="button"
            onClick={() => exec('justifyRight')}
            className="p-1.5 hover:bg-slate-200 rounded transition cursor-pointer"
            title="Canh lề phải"
          >
            <AlignRight size={15} />
          </button>
          <button
            type="button"
            onClick={() => exec('justifyFull')}
            className="p-1.5 hover:bg-slate-200 rounded transition cursor-pointer"
            title="Canh đều 2 bên"
          >
            <AlignJustify size={15} />
          </button>
        </div>

        {/* Lists & Quotes */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 shrink-0">
          <button
            type="button"
            onClick={() => exec('insertUnorderedList')}
            className="p-1.5 hover:bg-slate-200 rounded transition cursor-pointer"
            title="Danh sách gạch đầu dòng"
          >
            <List size={14} />
          </button>
          <button
            type="button"
            onClick={() => exec('insertOrderedList')}
            className="p-1.5 hover:bg-slate-200 rounded transition cursor-pointer"
            title="Danh sách đánh số"
          >
            <ListOrdered size={14} />
          </button>
          <button
            type="button"
            onClick={() => applyFormatBlock('<blockquote>')}
            className="p-1.5 hover:bg-slate-200 rounded transition cursor-pointer"
            title="Trích dẫn Blockquote"
          >
            <Quote size={14} />
          </button>
          <button
            type="button"
            onClick={() => exec('insertHorizontalRule')}
            className="p-1.5 hover:bg-slate-200 rounded transition cursor-pointer"
            title="Đường kẻ ngang phân cách"
          >
            <Minus size={14} />
          </button>
        </div>

        {/* Clear Format */}
        <button
          type="button"
          onClick={() => exec('removeFormat')}
          className="p-1.5 text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
          title="Xóa định dạng"
        >
          <RemoveFormatting size={14} />
        </button>

      </div>

      {/* =========================================================================
          ACTIVE COMPONENT ACTION BAR (TOP PINNED SLATE STRIP - NEVER WRAPS)
         ========================================================================= */}
      {activeComp && !isSourceMode && (
        <div className="bg-slate-900 border-b border-slate-800 px-3.5 py-2 flex items-center justify-between gap-3 text-xs text-white shadow-md sticky top-0 z-20 overflow-x-auto whitespace-nowrap scrollbar-none animate-fadeIn">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="font-semibold text-slate-300 text-xs">
              Đang chọn thẻ: <strong className="text-white font-black">{getComponentLabel(activeComp)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Move Up */}
            <button
              type="button"
              onClick={moveComponentUp}
              className="h-7 px-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-lg font-bold flex items-center gap-1 transition cursor-pointer text-xs shrink-0"
              title="Di chuyển thẻ lên trên"
            >
              <ArrowUp size={13} /> Lên
            </button>

            {/* Move Down */}
            <button
              type="button"
              onClick={moveComponentDown}
              className="h-7 px-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-lg font-bold flex items-center gap-1 transition cursor-pointer text-xs shrink-0"
              title="Di chuyển thẻ xuống dưới"
            >
              <ArrowDown size={13} /> Xuống
            </button>

            {/* Clone */}
            <button
              type="button"
              onClick={cloneComponent}
              className="h-7 px-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-lg font-bold flex items-center gap-1 transition cursor-pointer text-xs shrink-0"
              title="Nhân đôi thẻ này"
            >
              <Copy size={13} /> Nhân đôi
            </button>

            {/* Style Dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setStyleDropdownOpen(!styleDropdownOpen)}
                className="h-7 px-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer text-xs shrink-0"
                title="Đổi phong cách viền & màu nền thẻ"
              >
                <Palette size={13} className="text-indigo-400" />
                <span>Đổi Style</span>
                <ChevronDown size={12} />
              </button>

              {styleDropdownOpen && (
                <div className="absolute top-full right-0 mt-1.5 z-40 bg-white border border-slate-200 rounded-2xl p-2 shadow-2xl w-64 space-y-1 animate-fadeIn text-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Chọn phong cách thẻ:
                  </div>
                  <button
                    type="button"
                    onClick={() => applyComponentStyle('white')}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="w-3.5 h-3.5 rounded border border-slate-300 bg-white shadow-2xs shrink-0"></span>
                    <span>Card Trắng Tiêu Chuẩn</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyComponentStyle('deal')}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-rose-50 rounded-xl text-xs font-semibold text-rose-900 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="w-3.5 h-3.5 rounded border border-rose-500 bg-rose-50 shadow-2xs shrink-0"></span>
                    <span>Khung Deal Nổi Bật (Đỏ/Cam)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyComponentStyle('dark')}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-900 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="w-3.5 h-3.5 rounded bg-slate-900 shadow-2xs shrink-0"></span>
                    <span>Khung Đen Sang Trọng (Verdict)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyComponentStyle('emerald')}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-emerald-50 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="w-3.5 h-3.5 rounded border border-emerald-400 bg-emerald-50 shadow-2xs shrink-0"></span>
                    <span>Khung Xanh Pro (Ưu Điểm/Tip)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyComponentStyle('amber')}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-amber-50 rounded-xl text-xs font-semibold text-amber-900 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="w-3.5 h-3.5 rounded border border-amber-400 bg-amber-50 shadow-2xs shrink-0"></span>
                    <span>Khung Vàng Chú Ý (Cảnh Báo)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyComponentStyle('minimal')}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-2 cursor-pointer border-t border-slate-100 mt-1 pt-1.5"
                  >
                    <span className="w-3.5 h-3.5 rounded border border-dashed border-slate-300 bg-transparent shrink-0"></span>
                    <span>Khung Tối Giản Không Viền</span>
                  </button>
                </div>
              )}
            </div>

            {/* Chèn Ảnh */}
            <button
              type="button"
              onClick={() => setImageModalOpen(true)}
              className="h-7 px-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-lg font-bold flex items-center gap-1 transition cursor-pointer text-xs shrink-0"
              title="Chèn ảnh vào component này"
            >
              <ImageIcon size={13} className="text-indigo-400" /> Chèn Ảnh
            </button>

            {/* Thư viện Media */}
            <button
              type="button"
              onClick={() => setMediaLibraryOpen(true)}
              className="h-7 px-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 hover:text-white rounded-lg font-bold flex items-center gap-1 transition cursor-pointer text-xs shrink-0"
              title="Chọn ảnh từ Thư viện Media hệ thống"
            >
              <FolderOpen size={13} className="text-indigo-400" /> Thư viện Media
            </button>

            {/* NÚT XÓA THẺ NÀY - NẰM CÙNG DÒNG, KHÔNG BAO GIỜ WRAP */}
            <button
              type="button"
              onClick={deleteActiveBox}
              className="h-7 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-xs text-xs shrink-0 ml-1"
              title="Xóa toàn bộ thẻ/component đang chọn"
            >
              <Trash2 size={13} />
              <span>Xóa Thẻ Này</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          LIVE TABLE OF CONTENTS BAR (COMPACT SINGLE-LINE HORIZONTAL STEPPER)
         ========================================================================= */}
      {tocOpen && (
        <div className="bg-slate-50/90 border-b border-slate-200 px-3 py-1.5 text-xs">
          <div className="flex items-center justify-between gap-3 overflow-x-auto whitespace-nowrap scrollbar-none">
            <div className="flex items-center gap-2 shrink-0">
              <span className="p-1 rounded-md bg-rose-50 text-[#C62828] border border-rose-200 shrink-0">
                <ListTree size={13} />
              </span>
              <span className="font-extrabold text-slate-800 text-xs">
                Mục Lục (TOC):
              </span>
              <span className="bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                {tocList.length} mục
              </span>
            </div>

            {/* Horizontal scrollable stepper chips */}
            {tocList.length === 0 ? (
              <span className="text-[11px] text-slate-400 italic truncate">
                Chưa có tiêu đề H2/H3. Bấm "+ Thêm Component" hoặc chọn H2 để đề mục xuất hiện tại đây.
              </span>
            ) : (
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 max-w-2xl">
                {tocList.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => scrollToHeading(item.label, idx)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      item.level === 'h2'
                        ? 'bg-white border-slate-200 text-slate-800 hover:border-[#C62828] hover:text-[#C62828] shadow-2xs'
                        : 'bg-slate-100/90 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                    title={`Nhảy tới: ${item.label}`}
                  >
                    <span
                      className={`text-[9px] font-black uppercase px-1 rounded shrink-0 ${
                        item.level === 'h2'
                          ? 'bg-rose-100 text-[#C62828]'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {item.level.toUpperCase()}
                    </span>
                    <span className="truncate max-w-[150px]">{item.label}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
              <button
                type="button"
                onClick={insertTocBox}
                className="h-6.5 px-2.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-[#C62828] rounded-md font-bold text-[11px] flex items-center gap-1 transition cursor-pointer shadow-2xs shrink-0"
                title="Chèn box mục lục dạng khối bài viết vào nội dung"
              >
                <PlusCircle size={12} className="text-[#C62828]" />
                <span>Chèn Box TOC vào bài</span>
              </button>
              <button
                type="button"
                onClick={() => setTocOpen(false)}
                className="h-6.5 px-1.5 text-slate-400 hover:text-slate-700 rounded-md text-[11px] transition cursor-pointer shrink-0"
                title="Đóng thanh mục lục"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          EDITOR CANVAS: DRAG & DROP IMAGES, INTERACTIVE EDITORIAL BOXES
         ========================================================================= */}
      <div className="relative flex-1 bg-white">
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
              title="Di chuyển thẻ lên"
            >
              <ArrowUp size={12} /> Lên
            </button>
            <button
              type="button"
              onClick={moveComponentDown}
              className="px-1.5 py-0.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition flex items-center gap-0.5 text-[11px] font-semibold cursor-pointer"
              title="Di chuyển thẻ xuống"
            >
              <ArrowDown size={12} /> Xuống
            </button>
            <button
              type="button"
              onClick={cloneComponent}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition cursor-pointer"
              title="Nhân đôi thẻ này"
            >
              <Copy size={12} />
            </button>
            <button
              type="button"
              onClick={() => setStyleDropdownOpen(!styleDropdownOpen)}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition cursor-pointer"
              title="Đổi phong cách thẻ"
            >
              <Palette size={12} />
            </button>
            <div className="h-3.5 w-px bg-slate-700 mx-1" />
            <button
              type="button"
              onClick={deleteActiveBox}
              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-lg transition flex items-center gap-1 text-[11px] shadow-xs cursor-pointer"
              title="Xóa thẻ này khỏi bài viết"
            >
              <Trash2 size={12} />
              <span>Xóa Thẻ</span>
            </button>
          </div>
        )}
        {isSourceMode ? (
          <textarea
            value={sourceCode}
            onChange={handleSourceChange}
            className="w-full p-5 font-mono text-xs text-slate-800 bg-slate-900 text-emerald-400 focus:outline-none resize-y min-h-[360px]"
            style={{ minHeight }}
            placeholder="Edit raw HTML markup..."
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            onClick={handleEditorClick}
            onKeyUp={() => {
              const sel = window.getSelection();
              if (sel?.anchorNode) {
                const comp = findEnclosingComponent(sel.anchorNode);
                selectComponent(comp);
              }
            }}
            onMouseUp={() => {
              const sel = window.getSelection();
              if (sel?.anchorNode) {
                const comp = findEnclosingComponent(sel.anchorNode);
                selectComponent(comp);
              }
            }}
            onDrop={handleEditorDrop}
            className="w-full p-5 text-sm text-slate-900 focus:outline-none overflow-y-auto font-sans leading-relaxed prose prose-slate max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-lg prose-h3:mt-5 prose-h3:mb-2 prose-p:my-2.5 prose-p:leading-relaxed prose-a:text-[#C62828] prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-[#C62828] prose-blockquote:italic prose-blockquote:pl-4 prose-blockquote:my-4 prose-img:rounded-xl prose-ul:list-disc prose-ol:list-decimal"
            style={{ minHeight }}
            data-placeholder={placeholder}
          />
        )}
      </div>

      {/* =========================================================================
          BOTTOM STATS BAR
         ========================================================================= */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 text-[11px] text-slate-500 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span>Words: <strong className="text-slate-800">{stats.words}</strong></span>
          <span>Characters: <strong className="text-slate-800">{stats.characters}</strong></span>
          <span>Est. Reading Time: <strong className="text-[#C62828]">{stats.readTime}</strong></span>
        </div>
        <div className="text-[10px] text-slate-400 font-mono">
          Bargorya Editorial Editor v2.5 • Full Box & Style Suite
        </div>
      </div>
    </div>

      {/* =========================================================================
          MODAL: CẤU HÌNH DEAL BOX & ĐỔI LINK BUTTON (đổi link các button, đổi giá)
         ========================================================================= */}
      {dealModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tag size={16} className="text-[#C62828]" />
                <span>{editingBoxEl ? 'Chỉnh Sửa Deal Box & Đổi Link Button' : 'Chèn Deal Box Mới'}</span>
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
                <label className="font-bold text-slate-700 block mb-1">Tên sản phẩm / Tiêu đề Deal *</label>
                <input
                  type="text"
                  required
                  value={dealForm.title}
                  onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                  placeholder="e.g. Nilight 20-Inch Curved LED Light Bar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giá khuyến mãi *</label>
                  <input
                    type="text"
                    value={dealForm.dealPrice}
                    onChange={(e) => setDealForm({ ...dealForm, dealPrice: e.target.value })}
                    placeholder="$49.99"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828] font-bold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giá niêm yết cũ</label>
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
                  <label className="font-bold text-slate-700 block mb-1">Mã Voucher (Coupon)</label>
                  <input
                    type="text"
                    value={dealForm.couponCode}
                    onChange={(e) => setDealForm({ ...dealForm, couponCode: e.target.value })}
                    placeholder="BARGORYA20"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Badge Huy Hiệu</label>
                  <input
                    type="text"
                    value={dealForm.badge}
                    onChange={(e) => setDealForm({ ...dealForm, badge: e.target.value })}
                    placeholder="Verified Exclusive Deal"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828]"
                  />
                </div>
              </div>

              {/* ĐỔI LINK CÁC BUTTON */}
              <div className="pt-2 border-t border-slate-100 space-y-3 bg-rose-50/40 p-3 rounded-xl border">
                <div>
                  <label className="font-bold text-slate-900 block mb-1 flex items-center justify-between">
                    <span>Text hiển thị trên Button *</span>
                    <span className="text-[10px] text-slate-400">Button CTA Text</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={dealForm.buttonText}
                    onChange={(e) => setDealForm({ ...dealForm, buttonText: e.target.value })}
                    placeholder="Claim Deal at Official Store →"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828] font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-900 block mb-1 flex items-center justify-between">
                    <span>Đường Link Button (Affiliate / URL Mua Hàng) *</span>
                    <span className="text-[10px] text-slate-400">Target Destination</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={dealForm.buttonUrl}
                    onChange={(e) => setDealForm({ ...dealForm, buttonUrl: e.target.value })}
                    placeholder="https://www.nilight.com/?ref=bargorya"
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
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveDealBox}
                className="px-5 py-2 text-xs font-bold bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-lg shadow transition"
              >
                {editingBoxEl ? 'Cập Nhật Box & Link Button' : 'Chèn Deal Box Vào Bài'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CHÈN STANDALONE BUTTON CTA (đổi link các button độc lập)
         ========================================================================= */}
      {buttonModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MousePointerClick size={16} className="text-[#C62828]" />
                <span>Chèn Nút Bấm Button CTA Mới</span>
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
                <label className="font-bold text-slate-700 block mb-1">Chữ hiển thị trên nút *</label>
                <input
                  type="text"
                  required
                  value={buttonForm.text}
                  onChange={(e) => setButtonForm({ ...buttonForm, text: e.target.value })}
                  placeholder="e.g. Check Verified Price on Merchant Store →"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828] font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Đường dẫn liên kết (Link / URL) *</label>
                <input
                  type="url"
                  required
                  value={buttonForm.url}
                  onChange={(e) => setButtonForm({ ...buttonForm, url: e.target.value })}
                  placeholder="https://example.com/deal"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Màu sắc Button</label>
                  <select
                    value={buttonForm.style}
                    onChange={(e) => setButtonForm({ ...buttonForm, style: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828]"
                  >
                    <option value="crimson">Đỏ Crimson (Bargorya)</option>
                    <option value="emerald">Xanh Lá (Emerald)</option>
                    <option value="dark">Đen Tối (Dark Slate)</option>
                    <option value="outline">Viền Trong Suốt (Outline)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Canh lề</label>
                  <select
                    value={buttonForm.alignment}
                    onChange={(e) => setButtonForm({ ...buttonForm, alignment: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828]"
                  >
                    <option value="center">Canh giữa (Center)</option>
                    <option value="left">Canh trái (Left)</option>
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
                Hủy
              </button>
              <button
                type="button"
                onClick={handleInsertButton}
                disabled={!buttonForm.text.trim()}
                className="px-5 py-2 text-xs font-bold bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-lg shadow transition"
              >
                Chèn Button
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: UPLOAD ẢNH VÀO TRONG BÀI VIẾT (upload ảnh vào trong bài viết)
         ========================================================================= */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon size={16} className="text-[#C62828]" />
                <span>Upload & Chèn Ảnh Vào Thân Bài Viết</span>
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
                  1. Tải ảnh từ máy tính (PNG, JPG, WEBP, GIF)
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
                      <div className="text-xs font-bold text-[#C62828]">Đang tải ảnh lên máy chủ...</div>
                      <div className="w-40 bg-slate-200 h-1.5 rounded-full overflow-hidden mx-auto">
                        <div className="bg-[#C62828] h-full" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  ) : imageUrl ? (
                    <div className="text-center space-y-1">
                      <CheckCircle2 size={24} className="mx-auto text-emerald-500" />
                      <span className="font-bold text-emerald-700">Ảnh đã tải lên thành công!</span>
                      <p className="text-[10px] text-slate-400 truncate max-w-xs">{imageUrl}</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-1">
                      <Upload size={22} className="mx-auto text-[#C62828]" />
                      <span className="font-bold text-slate-800">Chọn file ảnh từ máy tính</span>
                      <p className="text-[10px] text-slate-400">hoặc kéo thả ảnh trực tiếp vào đây</p>
                    </div>
                  )}
                </label>
              </div>

              {/* Option 2: Image URL direct */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800 block">
                    2. Hoặc dán đường link ảnh trực tiếp
                  </label>
                  <button
                    type="button"
                    onClick={() => setMediaLibraryOpen(true)}
                    className="h-6 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md font-bold text-[11px] flex items-center gap-1 transition cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <FolderOpen size={12} />
                    <span>Chọn từ Thư viện Media</span>
                  </button>
                </div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... hoặc /uploads/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828] font-mono"
                />
              </div>

              {/* Caption & Alignment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Vị trí hiển thị (Alignment)</label>
                  <select
                    value={imageAlign}
                    onChange={(e) => setImageAlign(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828]"
                  >
                    <option value="center">Canh giữa (Center)</option>
                    <option value="full">Toàn chiều rộng (Full Width)</option>
                    <option value="left">Trôi bên trái (Float Left)</option>
                    <option value="right">Trôi bên phải (Float Right)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Chú thích ảnh (Caption)</label>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="e.g. Kết quả kiểm tra độ sáng thực tế..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleApplyImageModal}
                disabled={!imageUrl.trim()}
                className="px-5 py-2 text-xs font-bold bg-[#C62828] hover:bg-[#B71C1C] disabled:bg-slate-300 text-white rounded-lg shadow transition"
              >
                Chèn Ảnh Vào Bài Viết
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CHÈN / SỬA LINK HYPERLINK
         ========================================================================= */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <LinkIcon size={16} className="text-[#C62828]" />
                <span>Chèn hoặc Đổi Link Liên Kết</span>
              </h3>
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Đường dẫn liên kết (URL) *
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com/affiliate-link"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828] font-mono"
                  autoFocus
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Văn bản hiển thị (Anchor Text)
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. Xem giá khuyến mãi trên website chính hãng"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C62828]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                disabled={!linkUrl.trim()}
                className="px-4 py-1.5 text-xs font-bold bg-[#C62828] hover:bg-[#B71C1C] disabled:bg-slate-300 text-white rounded-lg transition"
              >
                Cập Nhật Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: THÊM COMPONENT / SECTION MỚI (+ THÊM COMPONENT)
         ========================================================================= */}
      {addCompModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-3xl w-full shadow-2xl space-y-5 animate-fadeIn max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <LayoutTemplate size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Thư Viện Component Chuẩn Editorial & Affiliate</h3>
                  <p className="text-xs text-slate-500">Chèn các khối nội dung được thiết kế sẵn chuẩn SEO vào bài viết với 1 click.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddCompModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {['all', 'Cấu trúc bài', 'Khuyến mãi & Deal', 'Đánh giá & So sánh', 'Hình ảnh & Media'].map((cat) => (
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
                    {cat === 'all' ? 'Tất Cả Mẫu' : cat}
                  </button>
                ))}
              </div>

              <div className="relative shrink-0 sm:w-60">
                <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm mẫu component..."
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
                      <span className="text-[11px] text-slate-400 font-medium">Chèn sau vị trí đang chọn</span>
                      <button
                        type="button"
                        onClick={() => insertTemplate(tpl.html)}
                        className="h-8 px-3.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                      >
                        <PlusCircle size={13} />
                        <span>Chèn Mẫu Này</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end border-t border-slate-100 pt-3 shrink-0">
              <button
                type="button"
                onClick={() => setAddCompModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: THƯ VIỆN MEDIA DÙNG CHUNG (TẬP TRUNG)
         ========================================================================= */}
      <MediaLibraryModal
        isOpen={mediaLibraryOpen}
        onClose={() => setMediaLibraryOpen(false)}
        onSelect={(selectedUrl) => {
          if (imageModalOpen) {
            setImageUrl(selectedUrl);
            setMediaLibraryOpen(false);
          } else {
            insertImageHTML(selectedUrl, 'Minh họa sản phẩm');
            setMediaLibraryOpen(false);
          }
        }}
        defaultFolder="articles"
      />

    </div>
  );
}
