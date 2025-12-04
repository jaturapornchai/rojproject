// components/reports/srr40006/DatePresetButtons.tsx

'use client';

import { DATE_PRESETS } from '@/lib/reports/srr40006';

interface DatePresetButtonsProps {
    onPresetSelect: (preset: string) => void;
}

export function DatePresetButtons({ onPresetSelect }: DatePresetButtonsProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">เลือกช่วงเวลาด่วน</label>
            <div className="flex flex-wrap gap-2">
                {DATE_PRESETS.map(preset => (
                    <button
                        key={preset.value}
                        type="button"
                        onClick={() => onPresetSelect(preset.value)}
                        className="px-3 py-1.5 text-sm font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors"
                    >
                        {preset.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
