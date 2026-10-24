import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#171717] text-[#D4D4D0] pt-14 pb-10 border-t border-[#262626]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Column 1: Brand & Editorial Mission */}
        <div className="space-y-4">
          <div className="flex items-baseline gap-1.5">
            <span className="font-editorial text-2xl font-bold tracking-tight text-white">
              Bargorya<span className="text-[#C62828]">.</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8A8A2] border border-[#404040] px-1.5 py-0.5 rounded">
              Verified
            </span>
          </div>
          <p className="text-xs text-[#A8A8A2] leading-relaxed">
            Bargorya is an independent product review journal and curated deal discovery platform. Our editors test consumer electronics, gear, and promo codes daily to eliminate expired vouchers.
          </p>
          <div className="space-y-2 text-xs text-[#A8A8A2] pt-1">
            <div className="flex items-center gap-2 text-white font-medium">
              <CheckCircle2 size={14} className="text-[#C62828]" /> 100% Hand-Tested Promo Codes
            </div>
            <div className="flex items-center gap-2 text-[#A8A8A2]">
              <ShieldCheck size={14} className="text-[#A8A8A2]" /> Zero Sponsored Ranking Manipulation
            </div>
          </div>
        </div>

        {/* Column 2: Editorial Sections */}
        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-b border-[#262626] pb-2">
            Editorial Sections
          </h4>
          <ul className="space-y-2.5 text-xs text-[#A8A8A2]">
            <li>
              <Link href="/category/tech" className="hover:text-white transition-colors font-medium text-white">
                Technology & Innovations
              </Link>
            </li>
            <li>
              <Link href="/category/business" className="hover:text-white transition-colors">
                Business & Smart Economy
              </Link>
            </li>
            <li>
              <Link href="/category/reviews" className="hover:text-white transition-colors">
                Hands-On Product Reviews
              </Link>
            </li>
            <li>
              <Link href="/category/entertainment" className="hover:text-white transition-colors">
                Entertainment & Culture
              </Link>
            </li>
            <li>
              <Link href="/category/us-politics" className="hover:text-white transition-colors">
                US Politics & Global News
              </Link>
            </li>
            <li>
              <Link href={ROUTES.PUBLIC.ARTICLES} className="hover:text-[#C62828] transition-colors font-semibold">
                All Feature Articles →
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Trust & Governance */}
        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-b border-[#262626] pb-2">
            Editorial & Trust
          </h4>
          <ul className="space-y-2.5 text-xs text-[#A8A8A2]">
            <li>
              <Link href={ROUTES.PUBLIC.ARTICLES} className="hover:text-white transition-colors">
                Buying Guides & Reviews
              </Link>
            </li>
            <li>
              <Link href={ROUTES.PUBLIC.ABOUT_US} className="hover:text-white transition-colors">
                About Our Editorial Desk
              </Link>
            </li>
            <li>
              <Link href={ROUTES.PUBLIC.EDITORIAL_GUIDELINES} className="hover:text-white transition-colors">
                How We Test & Verify Products
              </Link>
            </li>
            <li>
              <Link href={ROUTES.PUBLIC.AFFILIATE_DISCLOSURE} className="hover:text-white transition-colors">
                Affiliate Disclosure Statement
              </Link>
            </li>
            <li>
              <Link href={ROUTES.PUBLIC.PRIVACY_POLICY} className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href={ROUTES.PUBLIC.TERMS} className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Affiliate Transparency Notice */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-b border-[#262626] pb-2">
            Affiliate Transparency
          </h4>
          <p className="text-[11px] text-[#A8A8A2] leading-relaxed">
            Bargorya is supported by our readers. When you click our partner links or activate coupon vouchers, we may earn an affiliate commission from merchant partners at zero extra cost to you.
          </p>
          <div className="pt-1">
            <Link 
              href={ROUTES.PUBLIC.AFFILIATE_DISCLOSURE} 
              className="text-xs font-semibold text-[#C62828] hover:underline inline-flex items-center gap-1"
            >
              Learn about our commission ethics →
            </Link>
          </div>
        </div>

      </div>

      {/* Bottom Legal Copyright */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-[#262626] text-xs text-[#737373] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          © 2026 Bargorya Media Group. All rights reserved.
        </div>
        <div className="text-[11px] text-[#737373]">
          The Independent Product Review & Smart Deals Journal.
        </div>
      </div>
    </footer>
  );
}
