'use client';

// Date Preset Buttons Component สำหรับ SRR20016

interface DatePresetButtonsProps {
    onPresetSelect: (preset: string) => void;
}

export function DatePresetButtons({ onPresetSelect }: DatePresetButtonsProps) {
    const presets = [
        { value: 'today', label: 'วันนี้' },
        { value: 'yesterday', label: 'เมื่อวานนี้' },
        { value: 'this_week', label: 'สัปดาห์นี้' },
        { value: 'last_week', label: 'สัปดาห์ก่อน' },
        { value: 'this_month', label: 'เดือนนี้' },
        { value: 'last_month', label: 'เดือนก่อน' },
        { value: 'this_year', label: 'ปีนี้' },
        { value: 'last_year', label: 'ปีก่อน' },
    ];

    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">เลือกช่วงเวลาด่วน</label>
            <div className="flex flex-wrap gap-2">
                {presets.map(preset => (
                    <button
                        key={preset.value}
                        type="button"
                        onClick={() => onPresetSelect(preset.value)}
                        className="px-3 py-1.5 text-sm font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-rose-100 hover:text-rose-700 transition-colors"
                    >
                        {preset.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
