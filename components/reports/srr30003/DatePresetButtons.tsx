// components/reports/srr30003/DatePresetButtons.tsx

'use client';

import { DATE_PRESETS } from '@/lib/reports/srr30003';

interface DatePresetButtonsProps {
    onPresetSelect: (preset: string) => void;
    activePreset?: string;
}

export function DatePresetButtons({ onPresetSelect, activePreset }: DatePresetButtonsProps) {
    return (
        <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-100">
            {DATE_PRESETS.map(({ value, label }) => (
                <button
                    key={value}
                    type="button"
                    onClick={() => onPresetSelect(value)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        activePreset === value
                            ? 'bg-blue-50 text-slate-900 ring-1 ring-blue-200'
                            : 'bg-slate-50 text-slate-900 hover:bg-blue-50 hover:text-slate-900'
                    }`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}
