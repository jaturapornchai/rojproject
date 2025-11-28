// Custom Hook สำหรับจัดการ Filter State - B4029

import { useState, useCallback } from 'react';
import type {
    ReportFilters,
    CustomerFilterState,
    BranchFilterState,
    FilterType
} from '@/lib/reports/b4029/types';
import {
    getDefaultCustomerFilterState,
    getDefaultBranchFilterState,
    getDefaultReportFilters
} from '@/lib/reports/b4029/config';

export interface UseReportFiltersReturn {
    filters: ReportFilters;

    // Customer Filter
    setCustomerFilterType: (type: FilterType) => void;
    setSelectedCustomer: (code: string) => void;
    setCustomerRangeStart: (code: string) => void;
    setCustomerRangeEnd: (code: string) => void;
    toggleCustomerSelection: (code: string) => void;
    setSelectedCustomers: (codes: string[]) => void;
    resetCustomerFilter: () => void;

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

    // ===== Customer Filter =====

    const setCustomerFilterType = useCallback((type: FilterType) => {
        setFiltersState(prev => ({
            ...prev,
            customer: {
                ...getDefaultCustomerFilterState(),
                filterType: type
            }
        }));
    }, []);

    const setSelectedCustomer = useCallback((code: string) => {
        setFiltersState(prev => ({
            ...prev,
            customer: {
                ...prev.customer,
                selectedCustomer: code
            }
        }));
    }, []);

    const setCustomerRangeStart = useCallback((code: string) => {
        setFiltersState(prev => ({
            ...prev,
            customer: {
                ...prev.customer,
                rangeStart: code
            }
        }));
    }, []);

    const setCustomerRangeEnd = useCallback((code: string) => {
        setFiltersState(prev => ({
            ...prev,
            customer: {
                ...prev.customer,
                rangeEnd: code
            }
        }));
    }, []);

    const toggleCustomerSelection = useCallback((code: string) => {
        setFiltersState(prev => ({
            ...prev,
            customer: {
                ...prev.customer,
                selectedCustomers: prev.customer.selectedCustomers.includes(code)
                    ? prev.customer.selectedCustomers.filter(c => c !== code)
                    : [...prev.customer.selectedCustomers, code]
            }
        }));
    }, []);

    const setSelectedCustomers = useCallback((codes: string[]) => {
        setFiltersState(prev => ({
            ...prev,
            customer: {
                ...prev.customer,
                selectedCustomers: codes
            }
        }));
    }, []);

    const resetCustomerFilter = useCallback(() => {
        setFiltersState(prev => ({
            ...prev,
            customer: getDefaultCustomerFilterState()
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

        // Customer Filter
        setCustomerFilterType,
        setSelectedCustomer,
        setCustomerRangeStart,
        setCustomerRangeEnd,
        toggleCustomerSelection,
        setSelectedCustomers,
        resetCustomerFilter,

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
