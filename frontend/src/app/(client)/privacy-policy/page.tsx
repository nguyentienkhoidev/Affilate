import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { ShieldCheck, Lock } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">
            <Lock size={14} /> Data Protection & Privacy
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Effective Date: October 2026 | Compliant with GDPR & CCPA
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
          <p>
            At Bargorya, accessible from https://bargorya.com, the privacy of our visitors is one of our top priorities. This Privacy Policy document outlines the types of information we collect and how we use and protect it.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pt-2">1. Information We Collect</h2>
          <p>
            We collect minimal information necessary to deliver optimal discount search experiences:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li><strong>Log Files:</strong> IP address (anonymized), browser type, referring/exit pages, date and time stamps.</li>
            <li><strong>Contact Submissions:</strong> Name and email address when you voluntarily submit a message or coupon report via our contact form.</li>
            <li><strong>Cookies:</strong> Session cookies to track favorite stores or outbound affiliate referrals.</li>
          </ul>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pt-2">2. How We Use Your Information</h2>
          <p>
            The information we collect is used strictly for operational purposes:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li>To operate and maintain our coupon and review portal.</li>
            <li>To measure coupon popularity and verify affiliate referral tracking with partner networks.</li>
            <li>To reply to user inquiries, store submissions, and support requests.</li>
          </ul>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pt-2">3. No Sale of Personal Data</h2>
          <p>
            Bargorya does not sell, trade, rent, or lease any personally identifiable information to third parties or data brokers.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pt-2">4. Your Rights Under GDPR & CCPA</h2>
          <p>
            You have the right to request access to the data we hold about you, request rectification or erasure of your personal information, or object to processing. To exercise these rights, please contact us at <code className="text-xs font-bold text-indigo-600">privacy@bargorya.com</code>.
          </p>
        </div>

      </div>
    </div>
  );
}
