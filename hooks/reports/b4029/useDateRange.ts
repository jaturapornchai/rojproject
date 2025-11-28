// Custom Hook สำหรับจัดการ Date Range - B4029

import { useState, useCallback } from 'react';
import { calculateDateFromPreset } from '@/lib/reports/b4029/query-builder';

export interface UseDateRangeReturn {
    startDate: Date | null;
    endDate: Date | null;
    setStartDate: (date: Date | null) => void;
    setEndDate: (date: Date | null) => void;
    handlePreset: (preset: string) => void;
    handleMonthSelect: (monthIndex: number, year?: number) => void;
    handleYearSelect: (year: number) => void;
    setDateRange: (start: Date | null, end: Date | null) => void;
}

export interface UseDateRangeOptions {
    defaultPreset?: string;
    defaultStartDate?: Date | null;
    defaultEndDate?: Date | null;
}

export function useDateRange(options?: UseDateRangeOptions): UseDateRangeReturn {
    // ค่าเริ่มต้น - เดือนนี้
    const getInitialDates = (): { startDate: Date | null; endDate: Date | null } => {
        if (options?.defaultStartDate !== undefined && options?.defaultEndDate !== undefined) {
            return {
                startDate: options.defaultStartDate,
                endDate: options.defaultEndDate
            };
        }

        if (options?.defaultPreset) {
            const { startDate, endDate } = calculateDateFromPreset(options.defaultPreset);
            return { startDate, endDate };
        }

        // Default: เดือนนี้
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        return {
            startDate: new Date(currentYear, currentMonth, 1),
            endDate: new Date(currentYear, currentMonth + 1, 0)
        };
    };

    const initialDates = getInitialDates();
    const [startDate, setStartDate] = useState<Date | null>(initialDates.startDate);
    const [endDate, setEndDate] = useState<Date | null>(initialDates.endDate);

    const handlePreset = useCallback((preset: string) => {
        const { startDate: newStart, endDate: newEnd } = calculateDateFromPreset(preset);
        setStartDate(newStart);
        setEndDate(newEnd);
    }, []);

    const handleMonthSelect = useCallback((monthIndex: number, year?: number) => {
        const targetYear = year ?? startDate?.getFullYear() ?? new Date().getFullYear();
        const start = new Date(targetYear, monthIndex, 1);
        const end = new Date(targetYear, monthIndex + 1, 0); // วันสุดท้ายของเดือน
        setStartDate(start);
        setEndDate(end);
    }, [startDate]);

    const handleYearSelect = useCallback((year: number) => {
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31);
        setStartDate(start);
        setEndDate(end);
    }, []);

    const setDateRange = useCallback((start: Date | null, end: Date | null) => {
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
        setDateRange
    };
}
