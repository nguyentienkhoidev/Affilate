import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { ShieldCheck, Award, Users, CheckCircle, ArrowRight, HeartHandshake } from 'lucide-react';

export default function AboutUsPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 space-y-10">
        
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-12 shadow-sm space-y-4 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">
            <HeartHandshake size={14} /> Our Mission & Standards
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Saving Shoppers Millions, One Verified Coupon at a Time
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Founded with a passion for transparent savings, Bargorya was created to solve the biggest frustration in online shopping: expired, broken coupon codes that waste your time.
          </p>
        </div>

        {/* 3 Pillars of E-E-A-T */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-base text-slate-900">100% Tested Codes</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our researchers manually apply every voucher code on actual merchant checkout carts daily before marking it as verified.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award size={24} />
            </div>
            <h3 className="font-bold text-base text-slate-900">Independent Lab Reviews</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We purchase and evaluate products in-house. Our editorial reviews provide honest pros and cons, never swayed by affiliate partnerships.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users size={24} />
            </div>
            <h3 className="font-bold text-base text-slate-900">Shopper First Community</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time user feedback and vote counts help our algorithms identify which promo discounts are actively working right now.
            </p>
          </div>
        </div>

        {/* Full Editorial Story */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
          <h2 className="text-2xl font-bold text-slate-900">How Bargorya Works</h2>
          <p>
            The internet is flooded with automated scraper sites that republish dead coupons or fake discount percentages just to capture search traffic. Bargorya was built on the opposite philosophy: quality over spam.
          </p>
          <p>
            When a merchant launches a holiday flash sale or an exclusive coupon on networks like PartnerBoost, Impact, ShareASale, or CJ Affiliate, our automated feed ingests the raw offer. Next, an editor reviews the discount terms, tests the code on an active basket, and publishes it with clear expiration dates and usage terms.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 pt-4">Our Verification Protocol</h2>
          <ul className="space-y-3 text-xs sm:text-sm">
            <li className="flex items-start gap-3">
              <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={18} />
              <span><strong>Real-Cart Testing:</strong> Codes are tested with varied cart totals to confirm minimum spend thresholds.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={18} />
              <span><strong>Automated Expiration Archival:</strong> Codes past their expiry are instantly demoted to the Expired section.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={18} />
              <span><strong>Community Feedback Loop:</strong> Shoppers can report dead codes with 1 click to trigger immediate re-testing.</span>
            </li>
          </ul>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-500">Ready to save on your favorite stores?</span>
            <Link
              href={ROUTES.PUBLIC.STORES}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-3 rounded-xl shadow transition-colors"
            >
              Browse All Stores <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
