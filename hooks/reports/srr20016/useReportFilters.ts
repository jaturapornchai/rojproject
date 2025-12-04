// Custom Hook สำหรับจัดการ Filter State - SRR20016

import { useState, useCallback } from 'react';
import type {
    ReportFilters,
    ProductFilterState,
    ProductGroupFilterState,
    ProductBrandFilterState,
    FilterType
} from '@/lib/reports/srr20016/types';
import {
    getDefaultProductFilterState,
    getDefaultProductGroupFilterState,
    getDefaultProductBrandFilterState,
    getDefaultReportFilters
} from '@/lib/reports/srr20016/config';

export interface UseReportFiltersReturn {
    filters: ReportFilters;

    // Product Filter
    setProductFilterType: (type: FilterType) => void;
    setSelectedProduct: (code: string) => void;
    setProductRangeStart: (code: string) => void;
    setProductRangeEnd: (code: string) => void;
    toggleProductSelection: (code: string) => void;
    setSelectedProducts: (codes: string[]) => void;
    resetProductFilter: () => void;

    // Product Group Filter
    setProductGroupFilterType: (type: FilterType) => void;
    setSelectedProductGroup: (code: string) => void;
    setProductGroupRangeStart: (code: string) => void;
    setProductGroupRangeEnd: (code: string) => void;
    toggleProductGroupSelection: (code: string) => void;
    setSelectedProductGroups: (codes: string[]) => void;
    resetProductGroupFilter: () => void;

    // Product Brand Filter
    setProductBrandFilterType: (type: FilterType) => void;
    setSelectedProductBrand: (code: string) => void;
    setProductBrandRangeStart: (code: string) => void;
    setProductBrandRangeEnd: (code: string) => void;
    toggleProductBrandSelection: (code: string) => void;
    setSelectedProductBrands: (codes: string[]) => void;
    resetProductBrandFilter: () => void;

    // Bulk operations
    setFilters: (filters: ReportFilters) => void;
    resetAllFilters: () => void;
}

export function useReportFilters(initialFilters?: Partial<ReportFilters>): UseReportFiltersReturn {
    const [filters, setFiltersState] = useState<ReportFilters>(() => ({
        ...getDefaultReportFilters(),
        ...initialFilters
    }));

    // ===== Product Filter =====

    const setProductFilterType = useCallback((type: FilterType) => {
        setFiltersState(prev => ({
            ...prev,
            product: {
                ...getDefaultProductFilterState(),
                filterType: type
            }
        }));
    }, []);

    const setSelectedProduct = useCallback((code: string) => {
        setFiltersState(prev => ({
            ...prev,
            product: {
                ...prev.product,
                selectedProduct: code
            }
        }));
    }, []);

    const setProductRangeStart = useCallback((code: string) => {
        setFiltersState(prev => ({
            ...prev,
            product: {
                ...prev.product,
                rangeStart: code
            }
        }));
    }, []);

    const setProductRangeEnd = useCallback((code: string) => {
        setFiltersState(prev => ({
            ...prev,
            product: {
                ...prev.product,
                rangeEnd: code
            }
        }));
    }, []);

    const toggleProductSelection = useCallback((code: string) => {
        setFiltersState(prev => ({
            ...prev,
            product: {
                ...prev.product,
                selectedProducts: prev.product.selectedProducts.includes(code)
                    ? prev.product.selectedProducts.filter(c => c !== code)
                    : [...prev.product.selectedProducts, code]
            }
        }));
    }, []);

    const setSelectedProducts = useCallback((codes: string[]) => {
        setFiltersState(prev => ({
            ...prev,
            product: {
                ...prev.product,
                selectedProducts: codes
            }
        }));
    }, []);

    const resetProductFilter = useCallback(() => {
        setFiltersState(prev => ({
            ...prev,
            product: getDefaultProductFilterState()
        }));
    }, []);

    // ===== Product Group Filter =====

    const setProductGroupFilterType = useCallback((type: FilterType) => {
        setFiltersState(prev => ({
            ...prev,
            productGroup: {
                ...getDefaultProductGroupFilterState(),
                filterType: type
            }
        }));
    }, []);

    const setSelectedProductGroup = useCallback((code: string) => {
        setFiltersState(prev => ({
            ...prev,
            productGroup: {
                ...prev.productGroup,
                selectedProductGroup: code
            }
        }));
    }, []);

    const setProductGroupRangeStart = useCallback((code: string) => {
        setFiltersState(prev => ({
            ...prev,
            productGroup: {
                ...prev.productGroup,
                rangeStart: code
            }
        }));
    }, []);

    const setProductGroupRangeEnd = useCallback((code: string) => {
        setFiltersState(prev => ({
            ...prev,
            productGroup: {
                ...prev.productGroup,
                rangeEnd: code
            }
        }));
    }, []);

    const toggleProductGroupSelection = useCallback((code: string) => {
        setFiltersState(prev => ({
            ...prev,
            productGroup: {
                ...prev.productGroup,
                selectedProductGroups: prev.productGroup.selectedProductGroups.includes(code)
                    ? prev.productGroup.selectedProductGroups.filter(c => c !== code)
                    : [...prev.productGroup.selectedProductGroups, code]
            }
        }));
    }, []);

    const setSelectedProductGroups = useCallback((codes: string[]) => {
        setFiltersState(prev => ({
            ...prev,
            productGroup: {
                ...prev.productGroup,
                selectedProductGroups: codes
            }
        }));
    }, []);

    const resetProductGroupFilter = useCallback(() => {
        setFiltersState(prev => ({
            ...prev,
            productGroup: getDefaultProductGroupFilterState()
        }));
    }, []);

    // ===== Product Brand Filter =====

    const setProductBrandFilterType = useCallback((type: FilterType) => {
        setFiltersState(prev => ({
            ...prev,
            productBrand: {
                ...getDefaultProductBrandFilterState(),
                filterType: type
            }
        }));
    }, []);

    const setSelectedProductBrand = useCallback((code: string) => {
        setFiltersState(prev => ({
            ...prev,
            productBrand: {
                ...prev.productBrand,
                selectedProductBrand: code
            }
        }));
    }, []);

    const setProductBrandRangeStart = useCallback((code: string) => {
        setFiltersState(prev => ({
            ...prev,
            productBrand: {
                ...prev.productBrand,
                rangeStart: code
            }
        }));
    }, []);

    const setProductBrandRangeEnd = useCallback((code: string) => {
        setFiltersState(prev => ({
            ...prev,
            productBrand: {
                ...prev.productBrand,
                rangeEnd: code
            }
        }));
    }, []);

    const toggleProductBrandSelection = useCallback((code: string) => {
        setFiltersState(prev => ({
            ...prev,
            productBrand: {
                ...prev.productBrand,
                selectedProductBrands: prev.productBrand.selectedProductBrands.includes(code)
                    ? prev.productBrand.selectedProductBrands.filter(c => c !== code)
                    : [...prev.productBrand.selectedProductBrands, code]
            }
        }));
    }, []);

    const setSelectedProductBrands = useCallback((codes: string[]) => {
        setFiltersState(prev => ({
            ...prev,
            productBrand: {
                ...prev.productBrand,
                selectedProductBrands: codes
            }
        }));
    }, []);

    const resetProductBrandFilter = useCallback(() => {
        setFiltersState(prev => ({
            ...prev,
            productBrand: getDefaultProductBrandFilterState()
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

        // Product Filter
        setProductFilterType,
        setSelectedProduct,
        setProductRangeStart,
        setProductRangeEnd,
        toggleProductSelection,
        setSelectedProducts,
        resetProductFilter,

        // Product Group Filter
        setProductGroupFilterType,
        setSelectedProductGroup,
        setProductGroupRangeStart,
        setProductGroupRangeEnd,
        toggleProductGroupSelection,
        setSelectedProductGroups,
        resetProductGroupFilter,

        // Product Brand Filter
        setProductBrandFilterType,
        setSelectedProductBrand,
        setProductBrandRangeStart,
        setProductBrandRangeEnd,
        toggleProductBrandSelection,
        setSelectedProductBrands,
        resetProductBrandFilter,

        // Bulk operations
        setFilters,
        resetAllFilters
    };
}
