// hooks/reports/srr20011/useReportFilters.ts

import { useState, useCallback } from 'react';
import { getDefaultReportFilters, type ReportFilters, type FilterType } from '@/lib/reports/srr20011';

export const useReportFilters = () => {
    const [filters, setFilters] = useState<ReportFilters>(getDefaultReportFilters());

    // Product filter actions
    const setProductFilterType = useCallback((type: FilterType) => {
        setFilters(prev => ({
            ...prev,
            product: { ...prev.product, filterType: type }
        }));
    }, []);

    const setSelectedProduct = useCallback((productCode: string) => {
        setFilters(prev => ({
            ...prev,
            product: { ...prev.product, selectedProduct: productCode }
        }));
    }, []);

    const setProductRangeStart = useCallback((code: string) => {
        setFilters(prev => ({
            ...prev,
            product: { ...prev.product, rangeStart: code }
        }));
    }, []);

    const setProductRangeEnd = useCallback((code: string) => {
        setFilters(prev => ({
            ...prev,
            product: { ...prev.product, rangeEnd: code }
        }));
    }, []);

    const toggleProductSelection = useCallback((productCode: string) => {
        setFilters(prev => {
            const current = prev.product.selectedProducts;
            const updated = current.includes(productCode)
                ? current.filter(code => code !== productCode)
                : [...current, productCode];
            return {
                ...prev,
                product: { ...prev.product, selectedProducts: updated }
            };
        });
    }, []);

    // Product Group filter actions
    const setProductGroupFilterType = useCallback((type: FilterType) => {
        setFilters(prev => ({
            ...prev,
            productGroup: { ...prev.productGroup, filterType: type }
        }));
    }, []);

    const setSelectedProductGroup = useCallback((groupCode: string) => {
        setFilters(prev => ({
            ...prev,
            productGroup: { ...prev.productGroup, selectedGroup: groupCode }
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

    const toggleProductGroupSelection = useCallback((groupCode: string) => {
        setFilters(prev => {
            const current = prev.productGroup.selectedGroups;
            const updated = current.includes(groupCode)
                ? current.filter(code => code !== groupCode)
                : [...current, groupCode];
            return {
                ...prev,
                productGroup: { ...prev.productGroup, selectedGroups: updated }
            };
        });
    }, []);

    // Product Brand filter actions
    const setProductBrandFilterType = useCallback((type: FilterType) => {
        setFilters(prev => ({
            ...prev,
            productBrand: { ...prev.productBrand, filterType: type }
        }));
    }, []);

    const setSelectedProductBrand = useCallback((brandCode: string) => {
        setFilters(prev => ({
            ...prev,
            productBrand: { ...prev.productBrand, selectedBrand: brandCode }
        }));
    }, []);

    const setProductBrandRangeStart = useCallback((code: string) => {
        setFilters(prev => ({
            ...prev,
            productBrand: { ...prev.productBrand, rangeStart: code }
        }));
    }, []);

    const setProductBrandRangeEnd = useCallback((code: string) => {
        setFilters(prev => ({
            ...prev,
            productBrand: { ...prev.productBrand, rangeEnd: code }
        }));
    }, []);

    const toggleProductBrandSelection = useCallback((brandCode: string) => {
        setFilters(prev => {
            const current = prev.productBrand.selectedBrands;
            const updated = current.includes(brandCode)
                ? current.filter(code => code !== brandCode)
                : [...current, brandCode];
            return {
                ...prev,
                productBrand: { ...prev.productBrand, selectedBrands: updated }
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
        // Product
        setProductFilterType,
        setSelectedProduct,
        setProductRangeStart,
        setProductRangeEnd,
        toggleProductSelection,
        // Product Group
        setProductGroupFilterType,
        setSelectedProductGroup,
        setProductGroupRangeStart,
        setProductGroupRangeEnd,
        toggleProductGroupSelection,
        // Product Brand
        setProductBrandFilterType,
        setSelectedProductBrand,
        setProductBrandRangeStart,
        setProductBrandRangeEnd,
        toggleProductBrandSelection,
        // Reset
        resetAllFilters,
    };
};
