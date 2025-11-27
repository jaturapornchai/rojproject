// Custom Hook สำหรับจัดการ Filter State - SRR50003

import { useState, useCallback } from 'react';
import type {
    ReportFilters,
    EmployeeFilterState,
    BranchFilterState,
    FilterType
} from '@/lib/reports/srr50003/types';
import {
    getDefaultEmployeeFilterState,
    getDefaultBranchFilterState,
    getDefaultReportFilters
} from '@/lib/reports/srr50003/config';

export interface UseReportFiltersReturn {
    filters: ReportFilters;

    // Employee Filter
    setEmployeeFilterType: (type: FilterType) => void;
    setSelectedEmployee: (code: string) => void;
    setEmployeeRangeStart: (code: string) => void;
    setEmployeeRangeEnd: (code: string) => void;
    toggleEmployeeSelection: (code: string) => void;
    setSelectedEmployees: (codes: string[]) => void;
    resetEmployeeFilter: () => void;

    // Branch Filter
    setBranchFilterType: (type: FilterType) => void;
    setSelectedBranch: (code: string) => void;
    setBranchRangeStart: (code: string) => void;
    setBranchRangeEnd: (code: string) => void;
    toggleBranchSelection: (code: string) => void;
    setSelectedBranches: (codes: string[]) => void;
    resetBranchFilter: () => void;

    // Bulk operations
    setFilters: (filters: ReportFilters) => void;
    resetAllFilters: () => void;
}

export function useReportFilters(initialFilters?: Partial<ReportFilters>): UseReportFiltersReturn {
    const [filters, setFiltersState] = useState<ReportFilters>(() => ({
        ...getDefaultReportFilters(),
        ...initialFilters
    }));

    // ===== Employee Filter =====

    const setEmployeeFilterType = useCallback((type: FilterType) => {
        setFiltersState(prev => ({
            ...prev,
            employee: {
                ...getDefaultEmployeeFilterState(),
                filterType: type
            }
        }));
    }, []);

    const setSelectedEmployee = useCallback((code: string) => {
        setFiltersState(prev => ({
            ...prev,
            employee: {
                ...prev.employee,
                selectedEmployee: code
            }
        }));
    }, []);

    const setEmployeeRangeStart = useCallback((code: string) => {
        setFiltersState(prev => ({
            ...prev,
            employee: {
                ...prev.employee,
                rangeStart: code
            }
        }));
    }, []);

    const setEmployeeRangeEnd = useCallback((code: string) => {
        setFiltersState(prev => ({
            ...prev,
            employee: {
                ...prev.employee,
                rangeEnd: code
            }
        }));
    }, []);

    const toggleEmployeeSelection = useCallback((code: string) => {
        setFiltersState(prev => ({
            ...prev,
            employee: {
                ...prev.employee,
                selectedEmployees: prev.employee.selectedEmployees.includes(code)
                    ? prev.employee.selectedEmployees.filter(c => c !== code)
                    : [...prev.employee.selectedEmployees, code]
            }
        }));
    }, []);

    const setSelectedEmployees = useCallback((codes: string[]) => {
        setFiltersState(prev => ({
            ...prev,
            employee: {
                ...prev.employee,
                selectedEmployees: codes
            }
        }));
    }, []);

    const resetEmployeeFilter = useCallback(() => {
        setFiltersState(prev => ({
            ...prev,
            employee: getDefaultEmployeeFilterState()
        }));
    }, []);

    // ===== Branch Filter =====

    const setBranchFilterType = useCallback((type: FilterType) => {
        setFiltersState(prev => ({
            ...prev,
            branch: {
                ...getDefaultBranchFilterState(),
                filterType: type
            }
        }));
    }, []);

    const setSelectedBranch = useCallback((code: string) => {
        setFiltersState(prev => ({
            ...prev,
            branch: {
                ...prev.branch,
                selectedBranch: code
            }
        }));
    }, []);

    const setBranchRangeStart = useCallback((code: string) => {
        setFiltersState(prev => ({
            ...prev,
            branch: {
                ...prev.branch,
                rangeStart: code
            }
        }));
    }, []);

    const setBranchRangeEnd = useCallback((code: string) => {
        setFiltersState(prev => ({
            ...prev,
            branch: {
                ...prev.branch,
                rangeEnd: code
            }
        }));
    }, []);

    const toggleBranchSelection = useCallback((code: string) => {
        setFiltersState(prev => ({
            ...prev,
            branch: {
                ...prev.branch,
                selectedBranches: prev.branch.selectedBranches.includes(code)
                    ? prev.branch.selectedBranches.filter(c => c !== code)
                    : [...prev.branch.selectedBranches, code]
            }
        }));
    }, []);

    const setSelectedBranches = useCallback((codes: string[]) => {
        setFiltersState(prev => ({
            ...prev,
            branch: {
                ...prev.branch,
                selectedBranches: codes
            }
        }));
    }, []);

    const resetBranchFilter = useCallback(() => {
        setFiltersState(prev => ({
            ...prev,
            branch: getDefaultBranchFilterState()
        }));
    }, []);

    // ===== Bulk Operations =====

    const setFilters = useCallback((newFilters: ReportFilters) => {
        setFiltersState(newFilters);
    }, []);

    const resetAllFilters = useCallback(() => {
        setFiltersState(getDefaultReportFilters());
    }, []);

    return {
        filters,

        // Employee Filter
        setEmployeeFilterType,
        setSelectedEmployee,
        setEmployeeRangeStart,
        setEmployeeRangeEnd,
        toggleEmployeeSelection,
        setSelectedEmployees,
        resetEmployeeFilter,

        // Branch Filter
        setBranchFilterType,
        setSelectedBranch,
        setBranchRangeStart,
        setBranchRangeEnd,
        toggleBranchSelection,
        setSelectedBranches,
        resetBranchFilter,

        // Bulk operations
        setFilters,
        resetAllFilters
    };
}
