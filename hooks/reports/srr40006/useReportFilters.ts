// hooks/reports/srr40006/useReportFilters.ts

import { useState, useCallback } from 'react';
import { getDefaultReportFilters, type ReportFilters, type FilterType } from '@/lib/reports/srr40006';

export const useReportFilters = () => {
    const [filters, setFilters] = useState<ReportFilters>(getDefaultReportFilters());

    // Product Group filter actions
    const setProductGroupFilterType = useCallback((type: FilterType) => {
        setFilters(prev => ({
            ...prev,
            productGroup: { ...prev.productGroup, filterType: type }
        }));
    }, []);

    const setSelectedProductGroup = useCallback((code: string) => {
        setFilters(prev => ({
            ...prev,
            productGroup: { ...prev.productGroup, selectedProductGroup: code }
        }));
    }, []);

    const setProductGroupRangeStart = useCallback((code: string) => {
        setFilters(prev => ({
            ...prev,
            productGroup: { ...prev.productGroup, rangeStart: code }
        }));
    }, []);

    const setProductGroupRangeEnd = useCallback((code: string) => {
        setFilters(prev => ({
            ...prev,
            productGroup: { ...prev.productGroup, rangeEnd: code }
        }));
    }, []);

    const toggleProductGroupSelection = useCallback((code: string) => {
        setFilters(prev => {
            const current = prev.productGroup.selectedProductGroups;
            const updated = current.includes(code)
                ? current.filter(c => c !== code)
                : [...current, code];
            return {
                ...prev,
                productGroup: { ...prev.productGroup, selectedProductGroups: updated }
            };
        });
    }, []);

    // Warehouse filter actions
    const setWarehouseFilterType = useCallback((type: FilterType) => {
        setFilters(prev => ({
            ...prev,
            warehouse: { ...prev.warehouse, filterType: type }
        }));
    }, []);

    const setSelectedWarehouse = useCallback((code: string) => {
        setFilters(prev => ({
            ...prev,
            warehouse: { ...prev.warehouse, selectedWarehouse: code }
        }));
    }, []);

    const setWarehouseRangeStart = useCallback((code: string) => {
        setFilters(prev => ({
            ...prev,
            warehouse: { ...prev.warehouse, rangeStart: code }
        }));
    }, []);

    const setWarehouseRangeEnd = useCallback((code: string) => {
        setFilters(prev => ({
            ...prev,
            warehouse: { ...prev.warehouse, rangeEnd: code }
        }));
    }, []);

    const toggleWarehouseSelection = useCallback((code: string) => {
        setFilters(prev => {
            const current = prev.warehouse.selectedWarehouses;
            const updated = current.includes(code)
                ? current.filter(c => c !== code)
                : [...current, code];
            return {
                ...prev,
                warehouse: { ...prev.warehouse, selectedWarehouses: updated }
            };
        });
    }, []);

    // Brand filter actions
    const setBrandFilterType = useCallback((type: FilterType) => {
        setFilters(prev => ({
            ...prev,
            brand: { ...prev.brand, filterType: type }
        }));
    }, []);

    const setSelectedBrand = useCallback((code: string) => {
        setFilters(prev => ({
            ...prev,
            brand: { ...prev.brand, selectedBrand: code }
        }));
    }, []);

    const setBrandRangeStart = useCallback((code: string) => {
        setFilters(prev => ({
            ...prev,
            brand: { ...prev.brand, rangeStart: code }
        }));
    }, []);

    const setBrandRangeEnd = useCallback((code: string) => {
        setFilters(prev => ({
            ...prev,
            brand: { ...prev.brand, rangeEnd: code }
        }));
    }, []);

    const toggleBrandSelection = useCallback((code: string) => {
        setFilters(prev => {
            const current = prev.brand.selectedBrands;
            const updated = current.includes(code)
                ? current.filter(c => c !== code)
                : [...current, code];
            return {
                ...prev,
                brand: { ...prev.brand, selectedBrands: updated }
            };
        });
    }, []);

    // Reset all filters
    const resetAllFilters = useCallback(() => {
        setFilters(getDefaultReportFilters());
    }, []);

    return {
        filters,
        setFilters,
        // Product Group
        setProductGroupFilterType,
        setSelectedProductGroup,
        setProductGroupRangeStart,
        setProductGroupRangeEnd,
        toggleProductGroupSelection,
        // Warehouse
        setWarehouseFilterType,
        setSelectedWarehouse,
        setWarehouseRangeStart,
        setWarehouseRangeEnd,
        toggleWarehouseSelection,
        // Brand
        setBrandFilterType,
        setSelectedBrand,
        setBrandRangeStart,
        setBrandRangeEnd,
        toggleBrandSelection,
        // Reset
        resetAllFilters,
    };
};
