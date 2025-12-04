// hooks/reports/srr40006/useDateRange.ts

import { useState, useCallback } from 'react';
import { calculateDateFromPreset } from '@/lib/reports/srr40006';

interface UseDateRangeOptions {
    defaultPreset?: string;
}

export const useDateRange = (options: UseDateRangeOptions = {}) => {
    const { defaultPreset = 'this_month' } = options;

    // Initialize with default preset
    const initialDates = calculateDateFromPreset(defaultPreset);
    const [startDate, setStartDate] = useState<Date | null>(initialDates.startDate);
    const [endDate, setEndDate] = useState<Date | null>(initialDates.endDate);

    const handlePreset = useCallback((preset: string) => {
        const { startDate: start, endDate: end } = calculateDateFromPreset(preset);
        setStartDate(start);
        setEndDate(end);
    }, []);

    const handleMonthSelect = useCallback((month: number, year: number) => {
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0);
        setStartDate(start);
        setEndDate(end);
    }, []);

    const handleYearSelect = useCallback((year: number) => {
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31);
        setStartDate(start);
        setEndDate(end);
    }, []);

    return {
        startDate,
        endDate,
        setStartDate,
        setEndDate,
        handlePreset,
        handleMonthSelect,
        handleYearSelect,
    };
};
