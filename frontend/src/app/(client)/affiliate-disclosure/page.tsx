import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { ShieldAlert, CheckCircle, ExternalLink } from 'lucide-react';

export default function AffiliateDisclosurePage() {
  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-widest border border-amber-200">
            <ShieldAlert size={14} /> FTC Compliance Policy
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Affiliate Disclosure & Transparency Statement
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Last updated: October 2026
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
          <p>
            At <strong>Bargorya</strong> (accessible from <Link href={ROUTES.PUBLIC.HOME} className="text-indigo-600 underline">https://bargorya.com</Link>), we believe in complete honesty and transparency with our readers. In compliance with the Federal Trade Commission (FTC) guidelines concerning the use of endorsements and testimonials in advertising, this statement discloses our financial relationships with merchants and affiliate networks.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pt-2">1. How We Earn Compensation</h2>
          <p>
            Bargorya is a free service for consumers. We do not charge fees, require paid subscriptions, or monetize through intrusive pop-up advertisements. Instead, our business is funded primarily through <strong>affiliate marketing partnerships</strong>.
          </p>
          <p>
            When you click on links on our website (such as <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700">/go/[store]</code> or <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700">/out/[offerId]</code>) and make a purchase on the merchant’s website, the merchant may pay us a referral commission.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pt-2">2. Zero Cost to You</h2>
          <p>
            Clicking an affiliate link on Bargorya <strong>never</strong> increases the price you pay. In fact, using our exclusive coupon codes and promotional deals frequently results in a significant discount on your purchase.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pt-2">3. Editorial Independence</h2>
          <p>
            Our commercial relationships do not dictate our editorial opinions or review scores. Our testing lab independently evaluates products based on build quality, real-world performance, and pricing value. We will never rate an inferior product highly merely because an affiliate program offers a high commission rate.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pt-2">4. Affiliate Networks We Partner With</h2>
          <p>
            We maintain active affiliate relationships with reputable affiliate marketing platforms and direct merchant networks including:
          </p>
          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold text-slate-800 pt-1">
            <li className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">PartnerBoost</li>
            <li className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">Impact Radius</li>
            <li className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">ShareASale</li>
            <li className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">CJ Affiliate</li>
          </ul>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pt-2">5. Questions & Feedback</h2>
          <p>
            If you have any questions regarding our affiliate relationships or compliance policies, please visit our <Link href={ROUTES.PUBLIC.CONTACT_US} className="text-indigo-600 underline">Contact Us</Link> page.
          </p>
        </div>

      </div>
    </div>
  );
}
