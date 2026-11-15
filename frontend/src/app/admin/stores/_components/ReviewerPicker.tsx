'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, CheckCircle2, Loader2, UserCheck } from 'lucide-react';
import { ReviewerProfile } from '@/types/deals';
import storeService from '@/services/storeService';

interface ReviewerPickerProps {
  selectedName?: string;
  onSelect: (profile: ReviewerProfile) => void;
}

export default function ReviewerPicker({ selectedName, onSelect }: ReviewerPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ReviewerProfile[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchReviewers = async (searchText: string) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const list = await storeService.searchReviewerProfiles(searchText, controller.signal);
      if (!controller.signal.aborted) {
        setResults(list);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      fetchReviewers(query);
    }, 180);
    return () => clearTimeout(timer);
  }, [query, open]);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!open) setOpen(true);
            }}
            placeholder={
              selectedName
                ? `Switch saved reviewer (current: ${selectedName})...`
                : 'Search & select saved reviewer (or enter new name below)...'
            }
            className="w-full pl-8 pr-8 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
          />
          {loading && (
            <Loader2 size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />
          )}
        </div>
      </div>

      {open && (
        <div className="absolute z-30 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto divide-y divide-slate-100">
          {loading && results.length === 0 ? (
            <div className="px-3 py-3 text-xs text-slate-400 text-center">Searching saved reviewers...</div>
          ) : results.length === 0 ? (
            <div className="px-3 py-3 text-xs text-slate-500 text-center">
              No saved reviewer found. Enter name &amp; avatar below — it will be saved automatically on Store Save.
            </div>
          ) : (
            results.map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => {
                  onSelect(profile);
                  setQuery('');
                  setOpen(false);
                }}
                className="w-full px-3 py-2 flex items-center justify-between gap-2.5 hover:bg-emerald-50/60 transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {profile.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center justify-center shrink-0">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{profile.name}</p>
                    {profile.isVerified && (
                      <p className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 size={10} />
                        <span>Verified Buyer</span>
                      </p>
                    )}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                  <UserCheck size={11} />
                  <span>Select</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
