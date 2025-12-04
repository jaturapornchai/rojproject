// components/reports/srr40006/FilterSummary.tsx

'use client';

import type { ReportFilters, ProductGroup, Warehouse, Brand } from '@/lib/reports/srr40006';

interface FilterSummaryProps {
    filters: ReportFilters;
    productGroups: ProductGroup[];
    warehouses: Warehouse[];
    brands: Brand[];
    className?: string;
}

export function FilterSummary({
    filters,
    productGroups,
    warehouses,
    brands,
    className = '',
}: FilterSummaryProps) {
    const summaryItems: { label: string; color: string }[] = [];

    // Product Group summary
    if (filters.productGroup.filterType !== 'all') {
        if (filters.productGroup.filterType === 'single' && filters.productGroup.selectedProductGroup) {
            const pg = productGroups.find(p => p.code === filters.productGroup.selectedProductGroup);
            summaryItems.push({ label: `กลุ่ม: ${pg?.name_1 || filters.productGroup.selectedProductGroup}`, color: 'blue' });
        } else if (filters.productGroup.filterType === 'range' && filters.productGroup.rangeStart && filters.productGroup.rangeEnd) {
            summaryItems.push({ label: `กลุ่ม: ${filters.productGroup.rangeStart} - ${filters.productGroup.rangeEnd}`, color: 'blue' });
        } else if (filters.productGroup.filterType === 'multiple' && filters.productGroup.selectedProductGroups.length > 0) {
            summaryItems.push({ label: `กลุ่ม: ${filters.productGroup.selectedProductGroups.length} รายการ`, color: 'blue' });
        }
    }

    // Warehouse summary
    if (filters.warehouse.filterType !== 'all') {
        if (filters.warehouse.filterType === 'single' && filters.warehouse.selectedWarehouse) {
            const wh = warehouses.find(w => w.code === filters.warehouse.selectedWarehouse);
            summaryItems.push({ label: `คลัง: ${wh?.name_1 || filters.warehouse.selectedWarehouse}`, color: 'emerald' });
        } else if (filters.warehouse.filterType === 'range' && filters.warehouse.rangeStart && filters.warehouse.rangeEnd) {
            summaryItems.push({ label: `คลัง: ${filters.warehouse.rangeStart} - ${filters.warehouse.rangeEnd}`, color: 'emerald' });
        } else if (filters.warehouse.filterType === 'multiple' && filters.warehouse.selectedWarehouses.length > 0) {
            summaryItems.push({ label: `คลัง: ${filters.warehouse.selectedWarehouses.length} รายการ`, color: 'emerald' });
        }
    }

    // Brand summary
    if (filters.brand.filterType !== 'all') {
        if (filters.brand.filterType === 'single' && filters.brand.selectedBrand) {
            const b = brands.find(br => br.code === filters.brand.selectedBrand);
            summaryItems.push({ label: `ยี่ห้อ: ${b?.name_1 || filters.brand.selectedBrand}`, color: 'purple' });
        } else if (filters.brand.filterType === 'range' && filters.brand.rangeStart && filters.brand.rangeEnd) {
            summaryItems.push({ label: `ยี่ห้อ: ${filters.brand.rangeStart} - ${filters.brand.rangeEnd}`, color: 'purple' });
        } else if (filters.brand.filterType === 'multiple' && filters.brand.selectedBrands.length > 0) {
            summaryItems.push({ label: `ยี่ห้อ: ${filters.brand.selectedBrands.length} รายการ`, color: 'purple' });
        }
    }

    if (summaryItems.length === 0) return null;

    const getColorClass = (color: string) => {
        switch (color) {
            case 'blue': return 'bg-blue-100 text-blue-800';
            case 'emerald': return 'bg-emerald-100 text-emerald-800';
            case 'purple': return 'bg-purple-100 text-purple-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {summaryItems.map((item, index) => (
                <span key={index} className={`px-2 py-1 text-xs rounded-full ${getColorClass(item.color)}`}>
                    {item.label}
                </span>
            ))}
        </div>
    );
}
