'use client';

// Filter Summary Component สำหรับ SRR20016

import type {
    ReportFilters,
    Product,
    ProductGroup,
    ProductBrand
} from '@/lib/reports/srr20016/types';

interface FilterSummaryProps {
    filters: ReportFilters;
    products: Product[];
    productGroups: ProductGroup[];
    productBrands: ProductBrand[];
    className?: string;
}

export function FilterSummary({
    filters,
    products,
    productGroups,
    productBrands,
    className = ''
}: FilterSummaryProps) {
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
        if (filters.productGroup.filterType === 'single' && filters.productGroup.selectedProductGroup) {
            const group = productGroups.find(g => g.code === filters.productGroup.selectedProductGroup);
            summaryItems.push(`กลุ่มสินค้า: ${group?.name_1 || filters.productGroup.selectedProductGroup}`);
        } else if (filters.productGroup.filterType === 'range' && filters.productGroup.rangeStart && filters.productGroup.rangeEnd) {
            summaryItems.push(`กลุ่มสินค้า: ${filters.productGroup.rangeStart} - ${filters.productGroup.rangeEnd}`);
        } else if (filters.productGroup.filterType === 'multiple' && filters.productGroup.selectedProductGroups.length > 0) {
            summaryItems.push(`กลุ่มสินค้า: ${filters.productGroup.selectedProductGroups.length} รายการ`);
        }
    }

    // Product Brand summary
    if (filters.productBrand.filterType !== 'all') {
        if (filters.productBrand.filterType === 'single' && filters.productBrand.selectedProductBrand) {
            const brand = productBrands.find(b => b.code === filters.productBrand.selectedProductBrand);
            summaryItems.push(`ยี่ห้อ: ${brand?.name_1 || filters.productBrand.selectedProductBrand}`);
        } else if (filters.productBrand.filterType === 'range' && filters.productBrand.rangeStart && filters.productBrand.rangeEnd) {
            summaryItems.push(`ยี่ห้อ: ${filters.productBrand.rangeStart} - ${filters.productBrand.rangeEnd}`);
        } else if (filters.productBrand.filterType === 'multiple' && filters.productBrand.selectedProductBrands.length > 0) {
            summaryItems.push(`ยี่ห้อ: ${filters.productBrand.selectedProductBrands.length} รายการ`);
        }
    }

    if (summaryItems.length === 0) return null;

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {summaryItems.map((item, index) => (
                <span
                    key={index}
                    className="px-2 py-1 bg-rose-100 text-rose-800 text-xs rounded-full"
                >
                    {item}
                </span>
            ))}
        </div>
    );
}
