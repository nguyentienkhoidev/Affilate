'use client';

import { useState } from 'react';
import { Star, CheckCircle2, ChevronLeft, ChevronRight, ArrowRight, X } from 'lucide-react';
import { StoreCustomerReview, StoreRatingBreakdown } from '@/types/deals';

interface StoreCustomerReviewsSectionProps {
  storeName: string;
  rating: number;
  reviewCount: number;
  ratingBreakdown?: StoreRatingBreakdown;
  reviews: StoreCustomerReview[];
}

function computeFallbackBreakdown(reviews: StoreCustomerReview[]): StoreRatingBreakdown {
  if (reviews.length === 0) {
    return { fiveStar: 0, fourStar: 0, threeStar: 0, twoStar: 0, oneStar: 0 };
  }
  const counts = [0, 0, 0, 0, 0];
  for (const r of reviews) {
    const idx = Math.min(5, Math.max(1, Math.round(r.rating || 5))) - 1;
    counts[idx] += 1;
  }
  const total = reviews.length;
  return {
    fiveStar: Math.round((counts[4] / total) * 100),
    fourStar: Math.round((counts[3] / total) * 100),
    threeStar: Math.round((counts[2] / total) * 100),
    twoStar: Math.round((counts[1] / total) * 100),
    oneStar: Math.round((counts[0] / total) * 100),
  };
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'S';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

function ReviewStars({ rating, size = 13 }: { rating: number; size?: number }) {
  const clamped = Math.min(5, Math.max(1, Math.round(rating || 5)));
  return (
    <div className="flex items-center gap-0.5" aria-label={`${clamped} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= clamped
              ? 'fill-amber-400 text-amber-400'
              : 'fill-slate-200 text-slate-200'
          }
        />
      ))}
    </div>
  );
}

export default function StoreCustomerReviewsSection({
  storeName,
  rating,
  reviewCount,
  ratingBreakdown,
  reviews,
}: StoreCustomerReviewsSectionProps) {
  const activeReviews = reviews.filter((r) => r.isActive !== false && (r.reviewerName.trim() || r.comment.trim()));
  const [startIndex, setStartIndex] = useState(0);
  const [allModalOpen, setAllModalOpen] = useState(false);

  if (activeReviews.length === 0) {
    return null;
  }

  const hasCustomBreakdown =
    Boolean(ratingBreakdown) &&
    ((ratingBreakdown?.fiveStar ?? 0) > 0 ||
      (ratingBreakdown?.fourStar ?? 0) > 0 ||
      (ratingBreakdown?.threeStar ?? 0) > 0 ||
      (ratingBreakdown?.twoStar ?? 0) > 0 ||
      (ratingBreakdown?.oneStar ?? 0) > 0);

  const avgFromReviews =
    activeReviews.reduce((sum, r) => sum + Math.min(5, Math.max(1, Number(r.rating || 5))), 0) /
    activeReviews.length;

  const displayRating = hasCustomBreakdown
    ? (rating > 0 ? rating : avgFromReviews)
    : avgFromReviews;
  const displayTotalReviews = hasCustomBreakdown
    ? (reviewCount > 0 ? reviewCount : activeReviews.length)
    : activeReviews.length;
  const reviewWord = displayTotalReviews === 1 ? 'review' : 'reviews';

  const breakdown = hasCustomBreakdown ? ratingBreakdown! : computeFallbackBreakdown(activeReviews);

  const breakdownRows = [
    { stars: 5, pct: Math.min(100, Math.max(0, breakdown.fiveStar)) },
    { stars: 4, pct: Math.min(100, Math.max(0, breakdown.fourStar)) },
    { stars: 3, pct: Math.min(100, Math.max(0, breakdown.threeStar)) },
    { stars: 2, pct: Math.min(100, Math.max(0, breakdown.twoStar)) },
    { stars: 1, pct: Math.min(100, Math.max(0, breakdown.oneStar)) },
  ];

  const pageSize = 3;
  const maxStartIndex = Math.max(0, activeReviews.length - pageSize);
  const safeStart = Math.min(startIndex, maxStartIndex);
  const visibleReviews = activeReviews.slice(safeStart, safeStart + pageSize);

  return (
    <>
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs space-y-5">
        {/* Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            What Shoppers Say About {storeName}
          </h2>
          <button
            type="button"
            onClick={() => setAllModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
          >
            <span>See all {displayTotalReviews.toLocaleString()} {reviewWord}</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Main Content: Left Summary + Right Review Cards */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          {/* Left Rating Summary & Breakdown */}
          <div className="w-full lg:w-[210px] shrink-0 flex flex-col justify-between space-y-3">
            <div className="text-center lg:text-left space-y-1.5">
              <div className="text-4xl sm:text-[42px] font-black text-emerald-700 leading-none tracking-tight">
                {displayRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center lg:justify-start">
                <ReviewStars rating={Math.round(displayRating)} size={16} />
              </div>
              <p className="text-[11px] font-medium text-slate-500">
                Based on {displayTotalReviews.toLocaleString()} {reviewWord}
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              {breakdownRows.map((row) => (
                <div key={row.stars} className="flex items-center gap-2 text-[11px]">
                  <span className="w-6 font-bold text-slate-700 shrink-0 flex items-center gap-0.5">
                    {row.stars}
                    <Star size={10} className="fill-slate-700 text-slate-700" />
                  </span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-semibold text-slate-500 tabular-nums shrink-0">
                    {row.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Review Cards Carousel */}
          <div className="flex-1 min-w-0 relative flex items-center">
            {safeStart > 0 && (
              <button
                type="button"
                onClick={() => setStartIndex((prev) => Math.max(0, prev - 1))}
                aria-label="Previous reviews"
                className="hidden sm:flex absolute -left-3 z-10 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
            )}

            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleReviews.map((review, idx) => (
                <article
                  key={review.id ?? `${review.reviewerName}-${safeStart + idx}`}
                  className="border border-slate-100 rounded-xl p-4 bg-slate-50/30 hover:bg-white hover:border-slate-200 transition flex flex-col gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    {review.reviewerAvatar ? (
                      <img
                        src={review.reviewerAvatar}
                        alt={review.reviewerName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-200">
                        {getInitials(review.reviewerName)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-slate-900 truncate">
                        {review.reviewerName}
                      </h3>
                      {review.isVerified && (
                        <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 size={11} className="shrink-0" />
                          <span>Verified Buyer</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <ReviewStars rating={review.rating} size={12} />
                    {review.reviewDateLabel && (
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {review.reviewDateLabel}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                    {review.comment}
                  </p>
                </article>
              ))}
            </div>

            {safeStart < maxStartIndex && (
              <button
                type="button"
                onClick={() => setStartIndex((prev) => Math.min(maxStartIndex, prev + 1))}
                aria-label="Next reviews"
                className="hidden sm:flex absolute -right-3 z-10 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* See All Reviews Modal */}
      {allModalOpen && (
        <div
          onClick={() => setAllModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl border border-slate-200 overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  All Shopper Reviews for {storeName}
                </h3>
                <p className="text-xs text-slate-500">
                  {displayRating.toFixed(1)} average rating based on {displayTotalReviews.toLocaleString()} {reviewWord}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAllModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Close reviews modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3">
              {activeReviews.map((review, idx) => (
                <div
                  key={review.id ?? `modal-${review.reviewerName}-${idx}`}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {review.reviewerAvatar ? (
                        <img
                          src={review.reviewerAvatar}
                          alt={review.reviewerName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-200">
                          {getInitials(review.reviewerName)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">
                            {review.reviewerName}
                          </span>
                          {review.isVerified && (
                            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 size={11} />
                              <span>Verified Buyer</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <ReviewStars rating={review.rating} size={11} />
                          {review.reviewDateLabel && (
                            <span className="text-[11px] text-slate-400">
                              • {review.reviewDateLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
