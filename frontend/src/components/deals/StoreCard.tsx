import Link from 'next/link';
import { Store } from '@/types/deals';
import { ROUTES } from '@/constants/routes';
import { Star, ArrowRight, ShieldCheck } from 'lucide-react';

interface StoreCardProps {
  store: Store;
}

export default function StoreCard({ store }: StoreCardProps) {
  return (
    <Link
      href={ROUTES.PUBLIC.STORE_DETAIL(store.slug)}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-5 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className={`w-14 h-14 rounded-2xl ${store.logoBg} text-white flex items-center justify-center font-black text-xl shadow-sm group-hover:scale-105 transition-transform`}>
            {store.logoText}
          </div>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
            Up to {store.maxDiscount}
          </span>
        </div>

        <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-700 transition">
          {store.name}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
          {store.category}
        </p>

        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
          {store.description}
        </p>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
          <Star size={13} className="fill-amber-400 text-amber-400" />
          <span>{store.rating}</span>
          <span className="text-slate-400">({store.reviewCount})</span>
        </div>

        <span className="text-slate-500 font-medium group-hover:text-slate-900 flex items-center gap-1 transition">
          <span>{store.couponsCount} deals</span>
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
