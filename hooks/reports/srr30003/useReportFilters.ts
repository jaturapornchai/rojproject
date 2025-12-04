// hooks/reports/srr30003/useReportFilters.ts

import { useState, useCallback } from 'react';
import { getDefaultReportFilters, type ReportFilters, type FilterType } from '@/lib/reports/srr30003';

export const useReportFilters = () => {
    const [filters, setFilters] = useState<ReportFilters>(getDefaultReportFilters());

    // Document filter actions
    const setDocumentFilterType = useCallback((type: FilterType) => {
        setFilters(prev => ({
            ...prev,
            document: { ...prev.document, filterType: type }
        }));
    }, []);

    const setSelectedDocument = useCallback((docNo: string) => {
        setFilters(prev => ({
            ...prev,
            document: { ...prev.document, selectedDocument: docNo }
        }));
    }, []);

    const setDocumentRangeStart = useCallback((docNo: string) => {
        setFilters(prev => ({
            ...prev,
            document: { ...prev.document, rangeStart: docNo }
        }));
    }, []);

    const setDocumentRangeEnd = useCallback((docNo: string) => {
        setFilters(prev => ({
            ...prev,
            document: { ...prev.document, rangeEnd: docNo }
        }));
    }, []);

    const toggleDocumentSelection = useCallback((docNo: string) => {
        setFilters(prev => {
            const current = prev.document.selectedDocuments;
            const updated = current.includes(docNo)
                ? current.filter(d => d !== docNo)
                : [...current, docNo];
            return {
                ...prev,
                document: { ...prev.document, selectedDocuments: updated }
            };
        });
    }, []);

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

    // Warehouse filter actions
    const setWarehouseFilterType = useCallback((type: FilterType) => {
        setFilters(prev => ({
            ...prev,
            warehouse: { ...prev.warehouse, filterType: type }
        }));
    }, []);

    const setSelectedWarehouse = useCallback((warehouseCode: string) => {
        setFilters(prev => ({
            ...prev,
            warehouse: { ...prev.warehouse, selectedWarehouse: warehouseCode }
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

    const toggleWarehouseSelection = useCallback((warehouseCode: string) => {
        setFilters(prev => {
            const current = prev.warehouse.selectedWarehouses;
            const updated = current.includes(warehouseCode)
                ? current.filter(code => code !== warehouseCode)
                : [...current, warehouseCode];
            return {
                ...prev,
                warehouse: { ...prev.warehouse, selectedWarehouses: updated }
            };
        });
    }, []);

    // Shelf filter actions
    const setShelfFilterType = useCallback((type: FilterType) => {
        setFilters(prev => ({
            ...prev,
            shelf: { ...prev.shelf, filterType: type }
        }));
    }, []);

    const setSelectedShelf = useCallback((shelfCode: string) => {
        setFilters(prev => ({
            ...prev,
            shelf: { ...prev.shelf, selectedShelf: shelfCode }
        }));
    }, []);

    const setShelfRangeStart = useCallback((code: string) => {
        setFilters(prev => ({
            ...prev,
            shelf: { ...prev.shelf, rangeStart: code }
        }));
    }, []);

    const setShelfRangeEnd = useCallback((code: string) => {
        setFilters(prev => ({
            ...prev,
            shelf: { ...prev.shelf, rangeEnd: code }
        }));
    }, []);

    const toggleShelfSelection = useCallback((shelfCode: string) => {
        setFilters(prev => {
            const current = prev.shelf.selectedShelves;
            const updated = current.includes(shelfCode)
                ? current.filter(code => code !== shelfCode)
                : [...current, shelfCode];
            return {
                ...prev,
                shelf: { ...prev.shelf, selectedShelves: updated }
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
        // Document
        setDocumentFilterType,
        setSelectedDocument,
        setDocumentRangeStart,
        setDocumentRangeEnd,
        toggleDocumentSelection,
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
        // Warehouse
        setWarehouseFilterType,
        setSelectedWarehouse,
        setWarehouseRangeStart,
        setWarehouseRangeEnd,
        toggleWarehouseSelection,
        // Shelf
        setShelfFilterType,
        setSelectedShelf,
        setShelfRangeStart,
        setShelfRangeEnd,
        toggleShelfSelection,
        // Reset
        resetAllFilters,
    };
};
