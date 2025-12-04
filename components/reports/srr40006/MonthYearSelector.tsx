// components/reports/srr40006/MonthYearSelector.tsx

'use client';

import { useState } from 'react';
import { THAI_MONTHS } from '@/lib/reports/srr40006';

interface MonthYearSelectorProps {
    onMonthSelect: (month: number, year: number) => void;
    onYearSelect: (year: number) => void;
}

export function MonthYearSelector({ onMonthSelect, onYearSelect }: MonthYearSelectorProps) {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);

    // สร้าง array ปี ย้อนหลัง 5 ปี
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const handleYearChange = (year: number) => {
        setSelectedYear(year);
    };

    return (
        <div className="space-y-4">
            {/* Year Selection */}
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">เลือกปี</label>
                <div className="flex flex-wrap gap-2">
                    {years.map(year => (
                        <button
                            key={year}
                            type="button"
                            onClick={() => {
                                handleYearChange(year);
                                onYearSelect(year);
                            }}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                selectedYear === year
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-700'
                            }`}
                        >
                            {year + 543}
                        </button>
                    ))}
                </div>
            </div>

            {/* Month Selection */}
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">เลือกเดือน (ปี {selectedYear + 543})</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {THAI_MONTHS.map((month, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => onMonthSelect(index, selectedYear)}
                            className="px-3 py-2 text-sm font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                        >
                            {month.substring(0, 3)}.
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
