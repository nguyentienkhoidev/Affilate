import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  Award,
  Sparkles,
  Search,
  Scale,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editorial Guidelines & Testing Methodology | Bargorya',
  description:
    'Learn how Bargorya tests products, verifies coupon codes, maintains editorial independence, and adheres to strict standards.',
};

export default function EditorialGuidelinesPage() {
  return (
    <div className="bg-[#FAF9F5] min-h-screen py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Header Hero */}
        <div className="bg-white border border-[#E7E7E5] rounded-3xl p-6 sm:p-10 shadow-xs space-y-4">
          <div className="inline-flex items-center gap-2 text-[11px] font-black text-[#C62828] bg-red-50 border border-red-200 px-3 py-1 rounded-full uppercase tracking-widest">
            <ShieldCheck size={14} /> Trust &amp; Journalistic Integrity
          </div>
          <h1 className="font-editorial text-3xl sm:text-5xl font-black text-[#171717] tracking-tight leading-tight">
            Editorial Guidelines &amp; Testing Methodology
          </h1>
          <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
            Our mission is simple: provide honest, hands-on product reviews and 100% verified discount vouchers. Here is how our editorial desk operates with zero corporate compromise.
          </p>
          <div className="pt-2 flex items-center gap-4 text-xs text-[#737373] border-t border-[#F0F0EE]">
            <span>Last reviewed: <strong>October 2026</strong></span>
            <span>•</span>
            <span>Reviewed by: <strong>Bargorya Standards Desk</strong></span>
          </div>
        </div>

        {/* Content Body */}
        <div className="bg-white border border-[#E7E7E5] rounded-3xl p-6 sm:p-10 shadow-xs space-y-8 text-sm sm:text-base text-[#404040] leading-relaxed">
          
          {/* Pillar 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 text-[#C62828] font-black flex items-center justify-center text-sm">
                1
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
                Absolute Editorial Independence
              </h2>
            </div>
            <p>
              Bargorya maintains a strict firewall between our editorial team and our affiliate business development team. Our writers and lab testers evaluate consumer hardware, software services, and lifestyle goods without influence from advertising commissions.
            </p>
            <div className="bg-slate-50 border-l-4 border-[#C62828] p-4 rounded-r-2xl space-y-1 text-xs sm:text-sm text-[#525252]">
              <strong className="text-[#171717]">Core Rule:</strong> A higher affiliate commission rate never earns a merchant or product a higher score, favorable verdict, or preferential placement on Bargorya.
            </div>
          </section>

          {/* Pillar 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 text-[#C62828] font-black flex items-center justify-center text-sm">
                2
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
                The 4-Stage Hands-On Testing Protocol
              </h2>
            </div>
            <p>
              Before publishing any full product review, our editorial team subjects units to our standardized multi-stage benchmark:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4.5 bg-[#FAF9F5] border border-[#E7E7E5] rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-[#171717]">
                  <Search size={16} className="text-[#C62828]" /> 1. Unboxing &amp; Build Quality
                </div>
                <p className="text-xs text-[#737373]">
                  Inspecting materials, chassis tolerances, assembly precision, and real-world durability under daily handling.
                </p>
              </div>

              <div className="p-4.5 bg-[#FAF9F5] border border-[#E7E7E5] rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-[#171717]">
                  <Scale size={16} className="text-[#C62828]" /> 2. Stress Benchmarking
                </div>
                <p className="text-xs text-[#737373]">
                  Objective measurement using laboratory instruments (e.g. lux meters, thermal probes, audio decibels, battery runtimes).
                </p>
              </div>

              <div className="p-4.5 bg-[#FAF9F5] border border-[#E7E7E5] rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-[#171717]">
                  <Award size={16} className="text-[#C62828]" /> 3. Long-Term Living With It
                </div>
                <p className="text-xs text-[#737373]">
                  Testing the product in realistic scenarios for 14 to 30 days to uncover software glitches and ergonomic quirks.
                </p>
              </div>

              <div className="p-4.5 bg-[#FAF9F5] border border-[#E7E7E5] rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-[#171717]">
                  <RefreshCw size={16} className="text-[#C62828]" /> 4. Value &amp; Rival Comparison
                </div>
                <p className="text-xs text-[#737373]">
                  We stack the item directly against competitor products in the same price tier to determine if it is truly worth your money.
                </p>
              </div>
            </div>
          </section>

          {/* Pillar 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 text-[#C62828] font-black flex items-center justify-center text-sm">
                3
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
                Coupon Code Verification Standard
              </h2>
            </div>
            <p>
              The internet is flooded with expired, fake, or clickbait promo codes. At Bargorya, we believe misleading readers is unacceptable.
            </p>
            <div className="space-y-2 text-xs sm:text-sm text-[#525252]">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Cart Verification:</strong> Every coupon badge marked &ldquo;Verified&rdquo; was tested by our staff directly at the merchant checkout cart within the last 24 hours.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Explicit Exclusions:</strong> We list minimum spend requirements, category exclusions, and expiration dates clearly so you don&apos;t waste time.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Instant De-listing:</strong> Community feedback triggers immediate testing; non-working codes are deactivated within 15 minutes.</span>
              </div>
            </div>
          </section>

          {/* Pillar 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 text-[#C62828] font-black flex items-center justify-center text-sm">
                4
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
                Review Scoring Criteria (1.0 to 10.0)
              </h2>
            </div>
            <p>
              Our final review rating is a weighted average across five core dimensions:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-[#525252]">
              <li><strong>Design &amp; Ergonomics (20%):</strong> Aesthetics, materials, touchpoints, and everyday comfort.</li>
              <li><strong>Performance &amp; Reliability (30%):</strong> Measured speeds, benchmarks, uptime, and efficiency.</li>
              <li><strong>Features &amp; Innovation (20%):</strong> Software integration, connectivity, unique capabilities.</li>
              <li><strong>Price-to-Value Ratio (20%):</strong> Street price versus competition and expected product lifespan.</li>
              <li><strong>Manufacturer Support (10%):</strong> Warranty terms, documentation clarity, customer service responsiveness.</li>
            </ul>
          </section>

          {/* Contact desk */}
          <div className="pt-4 border-t border-[#E7E7E5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-[#737373]">
              Have a question about a review score or testing methodology?
            </div>
            <Link
              href={ROUTES.PUBLIC.CONTACT_US}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#C62828] hover:bg-red-800 text-white font-bold text-xs rounded-xl transition"
            >
              Contact Our Editorial Desk →
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
