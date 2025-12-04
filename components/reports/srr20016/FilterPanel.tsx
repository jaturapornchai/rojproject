'use client';

// Filter Panel Component สำหรับ SRR20016 - รายงานราคาสินค้าเปลี่ยนแปลง

import { useState } from 'react';
import type {
    Product,
    ProductGroup,
    ProductBrand,
    ReportFilters,
    FilterType
} from '@/lib/reports/srr20016/types';

interface FilterPanelProps {
    filters: ReportFilters;
    products: Product[];
    productGroups: ProductGroup[];
    productBrands: ProductBrand[];

    // Product Filter callbacks
    onProductFilterTypeChange: (type: FilterType) => void;
    onSelectedProductChange: (code: string) => void;
    onProductRangeStartChange: (code: string) => void;
    onProductRangeEndChange: (code: string) => void;
    onToggleProductSelection: (code: string) => void;

    // Product Group Filter callbacks
    onProductGroupFilterTypeChange: (type: FilterType) => void;
    onSelectedProductGroupChange: (code: string) => void;
    onProductGroupRangeStartChange: (code: string) => void;
    onProductGroupRangeEndChange: (code: string) => void;
    onToggleProductGroupSelection: (code: string) => void;

    // Product Brand Filter callbacks
    onProductBrandFilterTypeChange: (type: FilterType) => void;
    onSelectedProductBrandChange: (code: string) => void;
    onProductBrandRangeStartChange: (code: string) => void;
    onProductBrandRangeEndChange: (code: string) => void;
    onToggleProductBrandSelection: (code: string) => void;

    // Optional: แสดงหรือซ่อนส่วนต่างๆ
    showProductFilter?: boolean;
    showProductGroupFilter?: boolean;
    showProductBrandFilter?: boolean;

    // Compact mode สำหรับ schedule form
    compact?: boolean;
}

export function FilterPanel({
    filters,
    products,
    productGroups,
    productBrands,
    onProductFilterTypeChange,
    onSelectedProductChange,
    onProductRangeStartChange,
    onProductRangeEndChange,
    onToggleProductSelection,
    onProductGroupFilterTypeChange,
    onSelectedProductGroupChange,
    onProductGroupRangeStartChange,
    onProductGroupRangeEndChange,
    onToggleProductGroupSelection,
    onProductBrandFilterTypeChange,
    onSelectedProductBrandChange,
    onProductBrandRangeStartChange,
    onProductBrandRangeEndChange,
    onToggleProductBrandSelection,
    showProductFilter = true,
    showProductGroupFilter = true,
    showProductBrandFilter = true,
    compact = false
}: FilterPanelProps) {
    const [productSearch, setProductSearch] = useState('');
    const [productGroupSearch, setProductGroupSearch] = useState('');
    const [productBrandSearch, setProductBrandSearch] = useState('');
    const [showProductSection, setShowProductSection] = useState(false);
    const [showProductGroupSection, setShowProductGroupSection] = useState(false);
    const [showProductBrandSection, setShowProductBrandSection] = useState(false);

    // Filter products by search
    const filteredProducts = products.filter(p => {
        const searchLower = productSearch.toLowerCase();
        return p.code.toLowerCase().includes(searchLower) ||
               p.name_1.toLowerCase().includes(searchLower);
    });

    // Filter product groups by search
    const filteredProductGroups = productGroups.filter(g => {
        const searchLower = productGroupSearch.toLowerCase();
        return g.code.toLowerCase().includes(searchLower) ||
               g.name_1.toLowerCase().includes(searchLower);
    });

    // Filter product brands by search
    const filteredProductBrands = productBrands.filter(b => {
        const searchLower = productBrandSearch.toLowerCase();
        return b.code.toLowerCase().includes(searchLower) ||
               b.name_1.toLowerCase().includes(searchLower);
    });

    const filterTypeButtons = [
        { value: 'all' as const, label: 'ทั้งหมด' },
        { value: 'single' as const, label: 'เลือกเดี่ยว' },
        { value: 'range' as const, label: 'ช่วง' },
        { value: 'multiple' as const, label: 'เลือกหลายรายการ' }
    ];

    return (
        <div className={`space-y-${compact ? '4' : '6'}`}>
            {/* Product Filter */}
            {showProductFilter && (
                <div className="border border-slate-200 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setShowProductSection(!showProductSection)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left bg-slate-50 hover:bg-slate-100 transition-colors rounded-t-lg"
                    >
                        <span className="font-medium text-slate-900">🏷️ กรองสินค้า</span>
                        <span className="text-slate-500">{showProductSection ? '▼' : '▶'}</span>
                    </button>

                    {showProductSection && (
                        <div className="p-4 space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {filterTypeButtons.map(({ value, label }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => onProductFilterTypeChange(value)}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition ${
                                            filters.product.filterType === value
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {filters.product.filterType === 'single' && (
                                <select
                                    value={filters.product.selectedProduct}
                                    onChange={(e) => onSelectedProductChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                                >
                                    <option value="">-- เลือกสินค้า --</option>
                                    {products.map((p) => (
                                        <option key={p.code} value={p.code}>
                                            {p.code} - {p.name_1}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {filters.product.filterType === 'range' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        value={filters.product.rangeStart}
                                        onChange={(e) => onProductRangeStartChange(e.target.value)}
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                                    >
                                        <option value="">-- จาก --</option>
                                        {products.map((p) => (
                                            <option key={p.code} value={p.code}>{p.code}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={filters.product.rangeEnd}
                                        onChange={(e) => onProductRangeEndChange(e.target.value)}
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                                    >
                                        <option value="">-- ถึง --</option>
                                        {products.map((p) => (
                                            <option key={p.code} value={p.code}>{p.code}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {filters.product.filterType === 'multiple' && (
                                <div>
                                    <input
                                        type="text"
                                        placeholder="ค้นหาสินค้า..."
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-2 text-slate-900"
                                    />
                                    <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg">
                                        {filteredProducts.map((p) => (
                                            <label
                                                key={p.code}
                                                className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={filters.product.selectedProducts.includes(p.code)}
                                                    onChange={() => onToggleProductSelection(p.code)}
                                                    className="mr-2"
                                                />
                                                <span className="text-sm text-slate-900">
                                                    {p.code} - {p.name_1}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="mt-2 text-sm text-slate-600">
                                        เลือกแล้ว: {filters.product.selectedProducts.length} รายการ
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Product Group Filter */}
            {showProductGroupFilter && (
                <div className="border border-slate-200 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setShowProductGroupSection(!showProductGroupSection)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left bg-slate-50 hover:bg-slate-100 transition-colors rounded-t-lg"
                    >
                        <span className="font-medium text-slate-900">📦 กรองกลุ่มสินค้า</span>
                        <span className="text-slate-500">{showProductGroupSection ? '▼' : '▶'}</span>
                    </button>

                    {showProductGroupSection && (
                        <div className="p-4 space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {filterTypeButtons.map(({ value, label }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => onProductGroupFilterTypeChange(value)}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition ${
                                            filters.productGroup.filterType === value
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {filters.productGroup.filterType === 'single' && (
                                <select
                                    value={filters.productGroup.selectedProductGroup}
                                    onChange={(e) => onSelectedProductGroupChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                                >
                                    <option value="">-- เลือกกลุ่มสินค้า --</option>
                                    {productGroups.map((g) => (
                                        <option key={g.code} value={g.code}>
                                            {g.code} - {g.name_1}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {filters.productGroup.filterType === 'range' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        value={filters.productGroup.rangeStart}
                                        onChange={(e) => onProductGroupRangeStartChange(e.target.value)}
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                                    >
                                        <option value="">-- จาก --</option>
                                        {productGroups.map((g) => (
                                            <option key={g.code} value={g.code}>{g.code}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={filters.productGroup.rangeEnd}
                                        onChange={(e) => onProductGroupRangeEndChange(e.target.value)}
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                                    >
                                        <option value="">-- ถึง --</option>
                                        {productGroups.map((g) => (
                                            <option key={g.code} value={g.code}>{g.code}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {filters.productGroup.filterType === 'multiple' && (
                                <div>
                                    <input
                                        type="text"
                                        placeholder="ค้นหากลุ่มสินค้า..."
                                        value={productGroupSearch}
                                        onChange={(e) => setProductGroupSearch(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-2 text-slate-900"
                                    />
                                    <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg">
                                        {filteredProductGroups.map((g) => (
                                            <label
                                                key={g.code}
                                                className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={filters.productGroup.selectedProductGroups.includes(g.code)}
                                                    onChange={() => onToggleProductGroupSelection(g.code)}
                                                    className="mr-2"
                                                />
                                                <span className="text-sm text-slate-900">
                                                    {g.code} - {g.name_1}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="mt-2 text-sm text-slate-600">
                                        เลือกแล้ว: {filters.productGroup.selectedProductGroups.length} รายการ
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Product Brand Filter */}
            {showProductBrandFilter && (
                <div className="border border-slate-200 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setShowProductBrandSection(!showProductBrandSection)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left bg-slate-50 hover:bg-slate-100 transition-colors rounded-t-lg"
                    >
                        <span className="font-medium text-slate-900">🏢 กรองยี่ห้อสินค้า</span>
                        <span className="text-slate-500">{showProductBrandSection ? '▼' : '▶'}</span>
                    </button>

                    {showProductBrandSection && (
                        <div className="p-4 space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {filterTypeButtons.map(({ value, label }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => onProductBrandFilterTypeChange(value)}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition ${
                                            filters.productBrand.filterType === value
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {filters.productBrand.filterType === 'single' && (
                                <select
                                    value={filters.productBrand.selectedProductBrand}
                                    onChange={(e) => onSelectedProductBrandChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                                >
                                    <option value="">-- เลือกยี่ห้อสินค้า --</option>
                                    {productBrands.map((b) => (
                                        <option key={b.code} value={b.code}>
                                            {b.code} - {b.name_1}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {filters.productBrand.filterType === 'range' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        value={filters.productBrand.rangeStart}
                                        onChange={(e) => onProductBrandRangeStartChange(e.target.value)}
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                                    >
                                        <option value="">-- จาก --</option>
                                        {productBrands.map((b) => (
                                            <option key={b.code} value={b.code}>{b.code}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={filters.productBrand.rangeEnd}
                                        onChange={(e) => onProductBrandRangeEndChange(e.target.value)}
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                                    >
                                        <option value="">-- ถึง --</option>
                                        {productBrands.map((b) => (
                                            <option key={b.code} value={b.code}>{b.code}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {filters.productBrand.filterType === 'multiple' && (
                                <div>
                                    <input
                                        type="text"
                                        placeholder="ค้นหายี่ห้อสินค้า..."
                                        value={productBrandSearch}
                                        onChange={(e) => setProductBrandSearch(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-2 text-slate-900"
                                    />
                                    <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg">
                                        {filteredProductBrands.map((b) => (
                                            <label
                                                key={b.code}
                                                className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={filters.productBrand.selectedProductBrands.includes(b.code)}
                                                    onChange={() => onToggleProductBrandSelection(b.code)}
                                                    className="mr-2"
                                                />
                                                <span className="text-sm text-slate-900">
                                                    {b.code} - {b.name_1}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="mt-2 text-sm text-slate-600">
                                        เลือกแล้ว: {filters.productBrand.selectedProductBrands.length} รายการ
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
