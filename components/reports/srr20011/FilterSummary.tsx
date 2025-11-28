// components/reports/srr20011/FilterSummary.tsx

'use client';

import type { ReportFilters, Product, ProductGroup, ProductBrand } from '@/lib/reports/srr20011';

interface FilterSummaryProps {
    filters: ReportFilters;
    products: Product[];
    productGroups: ProductGroup[];
    productBrands: ProductBrand[];
    className?: string;
}

export const FilterSummary: React.FC<FilterSummaryProps> = ({
    filters,
    products,
    productGroups,
    productBrands,
    className = '',
}) => {
    const summaryItems: string[] = [];

    // Product summary
    if (filters.product.filterType !== 'all') {
        if (filters.product.filterType === 'single' && filters.product.selectedProduct) {
            const product = products.find(p => p.code === filters.product.selectedProduct);
            summaryItems.push(`สินค้า: ${product?.name_1 || filters.product.selectedProduct}`);
        } else if (filters.product.filterType === 'range' && filters.product.rangeStart && filters.product.rangeEnd) {
            summaryItems.push(`สินค้า: ${filters.product.rangeStart} - ${filters.product.rangeEnd}`);
        } else if (filters.product.filterType === 'multiple' && filters.product.selectedProducts.length > 0) {
            summaryItems.push(`สินค้า: ${filters.product.selectedProducts.length} รายการ`);
        }
    }

    // Product Group summary
    if (filters.productGroup.filterType !== 'all') {
        if (filters.productGroup.filterType === 'single' && filters.productGroup.selectedGroup) {
            const group = productGroups.find(g => g.code === filters.productGroup.selectedGroup);
            summaryItems.push(`กลุ่ม: ${group?.name_1 || filters.productGroup.selectedGroup}`);
        } else if (filters.productGroup.filterType === 'range' && filters.productGroup.rangeStart && filters.productGroup.rangeEnd) {
            summaryItems.push(`กลุ่ม: ${filters.productGroup.rangeStart} - ${filters.productGroup.rangeEnd}`);
        } else if (filters.productGroup.filterType === 'multiple' && filters.productGroup.selectedGroups.length > 0) {
            summaryItems.push(`กลุ่ม: ${filters.productGroup.selectedGroups.length} รายการ`);
        }
    }

    // Product Brand summary
    if (filters.productBrand.filterType !== 'all') {
        if (filters.productBrand.filterType === 'single' && filters.productBrand.selectedBrand) {
            const brand = productBrands.find(b => b.code === filters.productBrand.selectedBrand);
            summaryItems.push(`ยี่ห้อ: ${brand?.name_1 || filters.productBrand.selectedBrand}`);
        } else if (filters.productBrand.filterType === 'range' && filters.productBrand.rangeStart && filters.productBrand.rangeEnd) {
            summaryItems.push(`ยี่ห้อ: ${filters.productBrand.rangeStart} - ${filters.productBrand.rangeEnd}`);
        } else if (filters.productBrand.filterType === 'multiple' && filters.productBrand.selectedBrands.length > 0) {
            summaryItems.push(`ยี่ห้อ: ${filters.productBrand.selectedBrands.length} รายการ`);
        }
    }

    if (summaryItems.length === 0) return null;

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {summaryItems.map((item, index) => (
                <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                    {item}
                </span>
            ))}
        </div>
    );
};
