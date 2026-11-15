'use client';

import { useState } from 'react';
import { labelClass, inputClass } from '@/components/admin/AdminFormPage';

interface DisplayPositionPickerProps {
  value: number;
  onChange: (nextValue: number) => void;
  label?: string;
  hint?: string;
  presets?: number[];
  defaultOrderValue?: number;
}

const DEFAULT_PRESETS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function DisplayPositionPicker({
  value,
  onChange,
  label = 'Display Position',
  hint = 'Pick a pinned slot (#1 appears first) or Auto for default order.',
  presets = DEFAULT_PRESETS,
  defaultOrderValue = 9999,
}: DisplayPositionPickerProps) {
  const isAuto = !Number.isFinite(value) || value >= defaultOrderValue || value <= 0;
  const isPreset = !isAuto && presets.includes(value);
  const [showCustom, setShowCustom] = useState(!isAuto && !isPreset);

  return (
    <div className="space-y-2 pt-2 border-t border-slate-100">
      <div className="flex items-center justify-between gap-2">
        <label className={labelClass}>{label}</label>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
            isAuto
              ? 'bg-slate-100 text-slate-500'
              : 'bg-red-50 text-[#C62828] border border-red-200'
          }`}
        >
          {isAuto ? 'Auto' : `Position #${value}`}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => {
            setShowCustom(false);
            onChange(defaultOrderValue);
          }}
          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
            isAuto && !showCustom
              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          Auto
        </button>

        {presets.map((pos) => {
          const active = !showCustom && value === pos;
          return (
            <button
              key={pos}
              type="button"
              onClick={() => {
                setShowCustom(false);
                onChange(pos);
              }}
              className={`min-w-[34px] px-2 py-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                active
                  ? 'bg-[#C62828] text-white border-[#C62828] shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-[#C62828]/50 hover:text-[#C62828]'
              }`}
            >
              #{pos}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setShowCustom((prev) => !prev)}
          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
            showCustom || (!isAuto && !isPreset)
              ? 'bg-amber-50 text-amber-700 border-amber-300'
              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Custom
        </button>
      </div>

      {(showCustom || (!isAuto && !isPreset)) && (
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[11px] font-semibold text-slate-500 shrink-0">Slot #</span>
          <input
            type="number"
            min={1}
            max={9998}
            value={isAuto ? '' : value}
            placeholder="e.g. 12"
            onChange={(e) => {
              const parsed = parseInt(e.target.value, 10);
              onChange(Number.isFinite(parsed) && parsed > 0 ? parsed : defaultOrderValue);
            }}
            className={`${inputClass} py-1.5 text-xs max-w-[120px]`}
          />
        </div>
      )}

      <span className="block text-[11px] text-slate-400">{hint}</span>
    </div>
  );
}
