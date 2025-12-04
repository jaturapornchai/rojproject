// components/reports/srr30003/MonthYearSelector.tsx

'use client';

import { THAI_MONTHS } from '@/lib/reports/srr30003';

interface MonthYearSelectorProps {
    onMonthSelect: (monthIndex: number) => void;
    onYearSelect: (year: number) => void;
    currentYear?: number;
    yearsToShow?: number;
}

export function MonthYearSelector({
    onMonthSelect,
    onYearSelect,
    currentYear = new Date().getFullYear(),
    yearsToShow = 6
}: MonthYearSelectorProps) {
    const years = Array.from({ length: yearsToShow }, (_, i) => currentYear - i);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">เลือกเดือน</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {THAI_MONTHS.map((month, index) => (
                        <button
                            key={month}
                            type="button"
                            onClick={() => onMonthSelect(index)}
                            className="px-2 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-900 hover:bg-blue-50 hover:text-slate-900 hover:border-blue-200 transition-all"
                        >
                            {month}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">เลือกปี</label>
                <div className="grid grid-cols-3 gap-2">
                    {years.map((year) => (
                        <button
                            key={year}
                            type="button"
                            onClick={() => onYearSelect(year)}
                            className="px-2 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-900 hover:bg-blue-50 hover:text-slate-900 hover:border-blue-200 transition-all"
                        >
                            {year + 543}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
