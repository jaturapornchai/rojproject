// components/reports/srr30003/FilterSummary.tsx

'use client';

import type { ReportFilters, Document, Product, ProductGroup, ProductBrand, Warehouse, Shelf } from '@/lib/reports/srr30003';

interface FilterSummaryProps {
    filters: ReportFilters;
    documents: Document[];
    products: Product[];
    productGroups: ProductGroup[];
    productBrands: ProductBrand[];
    warehouses: Warehouse[];
    shelves: Shelf[];
    className?: string;
}

export const FilterSummary: React.FC<FilterSummaryProps> = ({
    filters,
    documents,
    products,
    productGroups,
    productBrands,
    warehouses,
    shelves,
    className = '',
}) => {
    const summaryItems: string[] = [];

    // Document summary
    if (filters.document.filterType !== 'all') {
        if (filters.document.filterType === 'single' && filters.document.selectedDocument) {
            const doc = documents.find(d => d.doc_no === filters.document.selectedDocument);
            summaryItems.push(`เอกสาร: ${doc?.doc_no || filters.document.selectedDocument}`);
        } else if (filters.document.filterType === 'range' && filters.document.rangeStart && filters.document.rangeEnd) {
            summaryItems.push(`เอกสาร: ${filters.document.rangeStart} - ${filters.document.rangeEnd}`);
        } else if (filters.document.filterType === 'multiple' && filters.document.selectedDocuments.length > 0) {
            summaryItems.push(`เอกสาร: ${filters.document.selectedDocuments.length} รายการ`);
        }
    }

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

    // Warehouse summary
    if (filters.warehouse.filterType !== 'all') {
        if (filters.warehouse.filterType === 'single' && filters.warehouse.selectedWarehouse) {
            const wh = warehouses.find(w => w.code === filters.warehouse.selectedWarehouse);
            summaryItems.push(`คลัง: ${wh?.name_1 || filters.warehouse.selectedWarehouse}`);
        } else if (filters.warehouse.filterType === 'range' && filters.warehouse.rangeStart && filters.warehouse.rangeEnd) {
            summaryItems.push(`คลัง: ${filters.warehouse.rangeStart} - ${filters.warehouse.rangeEnd}`);
        } else if (filters.warehouse.filterType === 'multiple' && filters.warehouse.selectedWarehouses.length > 0) {
            summaryItems.push(`คลัง: ${filters.warehouse.selectedWarehouses.length} รายการ`);
        }
    }

    // Shelf summary
    if (filters.shelf.filterType !== 'all') {
        if (filters.shelf.filterType === 'single' && filters.shelf.selectedShelf) {
            const sh = shelves.find(s => s.code === filters.shelf.selectedShelf);
            summaryItems.push(`พื้นที่เก็บ: ${sh?.name_1 || filters.shelf.selectedShelf}`);
        } else if (filters.shelf.filterType === 'range' && filters.shelf.rangeStart && filters.shelf.rangeEnd) {
            summaryItems.push(`พื้นที่เก็บ: ${filters.shelf.rangeStart} - ${filters.shelf.rangeEnd}`);
        } else if (filters.shelf.filterType === 'multiple' && filters.shelf.selectedShelves.length > 0) {
            summaryItems.push(`พื้นที่เก็บ: ${filters.shelf.selectedShelves.length} รายการ`);
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
