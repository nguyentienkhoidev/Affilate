import { X, Phone, Mail } from 'lucide-react';
import type { FeedbackItem } from '../_lib/data';

interface FeedbackDetailModalProps {
  message: FeedbackItem | null;
  onClose: () => void;
}

/**
 * Modal to preview full feedback / inquiry message content with direct email reply.
 */
export default function FeedbackDetailModal({ message, onClose }: FeedbackDetailModalProps) {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{message.name}</h2>
            <p className="text-xs text-slate-500">{message.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {message.phone && (
            <div className="flex items-center gap-2 text-slate-600">
              <Phone size={14} className="text-[#C62828]" /> {message.phone}
            </div>
          )}

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-wrap text-sm">
            {message.message}
          </div>

          <p className="text-[11px] text-slate-400 text-right">
            Received: {message.createdAt}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <a
            href={`mailto:${message.email}?subject=Regarding your HeyGoodly inquiry`}
            className="h-9 px-4 inline-flex items-center justify-center gap-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold rounded-xl transition-colors shadow-xs whitespace-nowrap shrink-0"
          >
            <Mail size={14} /> Reply via Email
          </a>

          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 inline-flex items-center justify-center text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
