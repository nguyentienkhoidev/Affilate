import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { FileText } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">
            <FileText size={14} /> Legal Terms & Conditions
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Last updated: October 2026
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Bargorya website, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you disagree with any part of these terms, you are prohibited from using our site.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pt-2">2. Accuracy of Coupon Codes & Deals</h2>
          <p>
            While our editorial team endeavors to ensure that all promotional vouchers, coupon codes, and deal listings are active and accurate, discounts are ultimately controlled by third-party merchants. Merchants reserve the right to alter, pause, or cancel promotions without advance notice. Bargorya cannot guarantee that all codes will function on every specific product variant or cart combination.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pt-2">3. Outbound Links & Third-Party Sites</h2>
          <p>
            Bargorya contains links to third-party merchant sites. We have no control over the content, terms, return policies, or privacy practices of these external websites. Your interactions with third-party merchants are solely between you and the respective merchant.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pt-2">4. Intellectual Property</h2>
          <p>
            All original articles, editorial reviews, guides, branding, and graphics produced by Bargorya are protected by international copyright laws. Brand names and logos featured belong to their respective trademark holders.
          </p>
        </div>

      </div>
    </div>
  );
}
