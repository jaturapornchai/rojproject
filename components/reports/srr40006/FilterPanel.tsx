// components/reports/srr40006/FilterPanel.tsx

'use client';

import { useState } from 'react';
import type { ReportFilters, ProductGroup, Warehouse, Brand, FilterType } from '@/lib/reports/srr40006';

interface FilterPanelProps {
    filters: ReportFilters;
    productGroups: ProductGroup[];
    warehouses: Warehouse[];
    brands: Brand[];
    // Product Group callbacks
    onProductGroupFilterTypeChange: (type: FilterType) => void;
    onSelectedProductGroupChange: (code: string) => void;
    onProductGroupRangeStartChange: (code: string) => void;
    onProductGroupRangeEndChange: (code: string) => void;
    onToggleProductGroupSelection: (code: string) => void;
    // Warehouse callbacks
    onWarehouseFilterTypeChange: (type: FilterType) => void;
    onSelectedWarehouseChange: (code: string) => void;
    onWarehouseRangeStartChange: (code: string) => void;
    onWarehouseRangeEndChange: (code: string) => void;
    onToggleWarehouseSelection: (code: string) => void;
    // Brand callbacks
    onBrandFilterTypeChange: (type: FilterType) => void;
    onSelectedBrandChange: (code: string) => void;
    onBrandRangeStartChange: (code: string) => void;
    onBrandRangeEndChange: (code: string) => void;
    onToggleBrandSelection: (code: string) => void;
}

const filterTypeLabels: Record<FilterType, string> = {
    'all': 'ทั้งหมด',
    'single': 'เลือกเดี่ยว',
    'range': 'ช่วง',
    'multiple': 'หลายรายการ'
};

export function FilterPanel({
    filters,
    productGroups,
    warehouses,
    brands,
    onProductGroupFilterTypeChange,
    onSelectedProductGroupChange,
    onProductGroupRangeStartChange,
    onProductGroupRangeEndChange,
    onToggleProductGroupSelection,
    onWarehouseFilterTypeChange,
    onSelectedWarehouseChange,
    onWarehouseRangeStartChange,
    onWarehouseRangeEndChange,
    onToggleWarehouseSelection,
    onBrandFilterTypeChange,
    onSelectedBrandChange,
    onBrandRangeStartChange,
    onBrandRangeEndChange,
    onToggleBrandSelection,
}: FilterPanelProps) {
    const [showProductGroupFilter, setShowProductGroupFilter] = useState(false);
    const [showWarehouseFilter, setShowWarehouseFilter] = useState(false);
    const [showBrandFilter, setShowBrandFilter] = useState(false);

    return (
        <div className="space-y-4">
            {/* Product Group Filter */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                    type="button"
                    onClick={() => setShowProductGroupFilter(!showProductGroupFilter)}
                    className="w-full px-4 py-3 bg-slate-50 flex items-center justify-between hover:bg-slate-100 transition-colors"
                >
                    <span className="font-medium text-slate-700">📦 กรองกลุ่มสินค้า</span>
                    <div className="flex items-center gap-2">
                        {filters.productGroup.filterType !== 'all' && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {filterTypeLabels[filters.productGroup.filterType]}
                            </span>
                        )}
                        <svg
                            className={`w-5 h-5 text-slate-500 transition-transform ${showProductGroupFilter ? 'rotate-180' : ''}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </button>

                {showProductGroupFilter && (
                    <div className="p-4 space-y-3 border-t border-slate-200">
                        {/* Filter Type Buttons */}
                        <div className="flex flex-wrap gap-2">
                            {(['all', 'single', 'range', 'multiple'] as FilterType[]).map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => onProductGroupFilterTypeChange(type)}
                                    className={`px-3 py-1.5 text-sm rounded-lg transition ${
                                        filters.productGroup.filterType === type
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    {filterTypeLabels[type]}
                                </button>
                            ))}
                        </div>

                        {/* Single Selection */}
                        {filters.productGroup.filterType === 'single' && (
                            <select
                                value={filters.productGroup.selectedProductGroup}
                                onChange={(e) => onSelectedProductGroupChange(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">-- เลือกกลุ่มสินค้า --</option>
                                {productGroups.map(pg => (
                                    <option key={pg.code} value={pg.code}>
                                        {pg.code} - {pg.name_1}
                                    </option>
                                ))}
                            </select>
                        )}

                        {/* Range Selection */}
                        {filters.productGroup.filterType === 'range' && (
                            <div className="grid grid-cols-2 gap-3">
                                <select
                                    value={filters.productGroup.rangeStart}
                                    onChange={(e) => onProductGroupRangeStartChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">-- เริ่มต้น --</option>
                                    {productGroups.map(pg => (
                                        <option key={pg.code} value={pg.code}>
                                            {pg.code} - {pg.name_1}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={filters.productGroup.rangeEnd}
                                    onChange={(e) => onProductGroupRangeEndChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">-- สิ้นสุด --</option>
                                    {productGroups.map(pg => (
                                        <option key={pg.code} value={pg.code}>
                                            {pg.code} - {pg.name_1}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Multiple Selection */}
                        {filters.productGroup.filterType === 'multiple' && (
                            <div className="space-y-2">
                                {filters.productGroup.selectedProductGroups.length > 0 && (
                                    <div className="flex flex-wrap gap-1 p-2 bg-blue-50 rounded-lg">
                                        <span className="text-xs text-blue-600 mr-1">เลือกแล้ว:</span>
                                        {filters.productGroup.selectedProductGroups.map(code => (
                                            <span
                                                key={code}
                                                onClick={() => onToggleProductGroupSelection(code)}
                                                className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded cursor-pointer hover:bg-red-100 hover:text-red-800"
                                            >
                                                {code} ×
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                    {productGroups.map((pg) => (
                                        <label
                                            key={pg.code}
                                            className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={filters.productGroup.selectedProductGroups.includes(pg.code)}
                                                onChange={() => onToggleProductGroupSelection(pg.code)}
                                                className="mr-2 rounded text-blue-600"
                                            />
                                            <span className="text-sm text-slate-900">
                                                {pg.code} - {pg.name_1}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Warehouse Filter */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                    type="button"
                    onClick={() => setShowWarehouseFilter(!showWarehouseFilter)}
                    className="w-full px-4 py-3 bg-slate-50 flex items-center justify-between hover:bg-slate-100 transition-colors"
                >
                    <span className="font-medium text-slate-700">🏭 กรองคลัง</span>
                    <div className="flex items-center gap-2">
                        {filters.warehouse.filterType !== 'all' && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                                {filterTypeLabels[filters.warehouse.filterType]}
                            </span>
                        )}
                        <svg
                            className={`w-5 h-5 text-slate-500 transition-transform ${showWarehouseFilter ? 'rotate-180' : ''}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </button>

                {showWarehouseFilter && (
                    <div className="p-4 space-y-3 border-t border-slate-200">
                        {/* Filter Type Buttons */}
                        <div className="flex flex-wrap gap-2">
                            {(['all', 'single', 'range', 'multiple'] as FilterType[]).map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => onWarehouseFilterTypeChange(type)}
                                    className={`px-3 py-1.5 text-sm rounded-lg transition ${
                                        filters.warehouse.filterType === type
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    {filterTypeLabels[type]}
                                </button>
                            ))}
                        </div>

                        {/* Single Selection */}
                        {filters.warehouse.filterType === 'single' && (
                            <select
                                value={filters.warehouse.selectedWarehouse}
                                onChange={(e) => onSelectedWarehouseChange(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="">-- เลือกคลัง --</option>
                                {warehouses.map(wh => (
                                    <option key={wh.code} value={wh.code}>
                                        {wh.code} - {wh.name_1}
                                    </option>
                                ))}
                            </select>
                        )}

                        {/* Range Selection */}
                        {filters.warehouse.filterType === 'range' && (
                            <div className="grid grid-cols-2 gap-3">
                                <select
                                    value={filters.warehouse.rangeStart}
                                    onChange={(e) => onWarehouseRangeStartChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <option value="">-- เริ่มต้น --</option>
                                    {warehouses.map(wh => (
                                        <option key={wh.code} value={wh.code}>
                                            {wh.code} - {wh.name_1}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={filters.warehouse.rangeEnd}
                                    onChange={(e) => onWarehouseRangeEndChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <option value="">-- สิ้นสุด --</option>
                                    {warehouses.map(wh => (
                                        <option key={wh.code} value={wh.code}>
                                            {wh.code} - {wh.name_1}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Multiple Selection */}
                        {filters.warehouse.filterType === 'multiple' && (
                            <div className="space-y-2">
                                {filters.warehouse.selectedWarehouses.length > 0 && (
                                    <div className="flex flex-wrap gap-1 p-2 bg-emerald-50 rounded-lg">
                                        <span className="text-xs text-emerald-600 mr-1">เลือกแล้ว:</span>
                                        {filters.warehouse.selectedWarehouses.map(code => (
                                            <span
                                                key={code}
                                                onClick={() => onToggleWarehouseSelection(code)}
                                                className="inline-flex items-center px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs rounded cursor-pointer hover:bg-red-100 hover:text-red-800"
                                            >
                                                {code} ×
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                    {warehouses.map((wh) => (
                                        <label
                                            key={wh.code}
                                            className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={filters.warehouse.selectedWarehouses.includes(wh.code)}
                                                onChange={() => onToggleWarehouseSelection(wh.code)}
                                                className="mr-2 rounded text-emerald-600"
                                            />
                                            <span className="text-sm text-slate-900">
                                                {wh.code} - {wh.name_1}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Brand Filter */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                    type="button"
                    onClick={() => setShowBrandFilter(!showBrandFilter)}
                    className="w-full px-4 py-3 bg-slate-50 flex items-center justify-between hover:bg-slate-100 transition-colors"
                >
                    <span className="font-medium text-slate-700">🏷️ กรองยี่ห้อสินค้า</span>
                    <div className="flex items-center gap-2">
                        {filters.brand.filterType !== 'all' && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                                {filterTypeLabels[filters.brand.filterType]}
                            </span>
                        )}
                        <svg
                            className={`w-5 h-5 text-slate-500 transition-transform ${showBrandFilter ? 'rotate-180' : ''}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </button>

                {showBrandFilter && (
                    <div className="p-4 space-y-3 border-t border-slate-200">
                        {/* Filter Type Buttons */}
                        <div className="flex flex-wrap gap-2">
                            {(['all', 'single', 'range', 'multiple'] as FilterType[]).map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => onBrandFilterTypeChange(type)}
                                    className={`px-3 py-1.5 text-sm rounded-lg transition ${
                                        filters.brand.filterType === type
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    {filterTypeLabels[type]}
                                </button>
                            ))}
                        </div>

                        {/* Single Selection */}
                        {filters.brand.filterType === 'single' && (
                            <select
                                value={filters.brand.selectedBrand}
                                onChange={(e) => onSelectedBrandChange(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            >
                                <option value="">-- เลือกยี่ห้อสินค้า --</option>
                                {brands.map(b => (
                                    <option key={b.code} value={b.code}>
                                        {b.code} - {b.name_1}
                                    </option>
                                ))}
                            </select>
                        )}

                        {/* Range Selection */}
                        {filters.brand.filterType === 'range' && (
                            <div className="grid grid-cols-2 gap-3">
                                <select
                                    value={filters.brand.rangeStart}
                                    onChange={(e) => onBrandRangeStartChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="">-- เริ่มต้น --</option>
                                    {brands.map(b => (
                                        <option key={b.code} value={b.code}>
                                            {b.code} - {b.name_1}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={filters.brand.rangeEnd}
                                    onChange={(e) => onBrandRangeEndChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="">-- สิ้นสุด --</option>
                                    {brands.map(b => (
                                        <option key={b.code} value={b.code}>
                                            {b.code} - {b.name_1}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Multiple Selection */}
                        {filters.brand.filterType === 'multiple' && (
                            <div className="space-y-2">
                                {filters.brand.selectedBrands.length > 0 && (
                                    <div className="flex flex-wrap gap-1 p-2 bg-purple-50 rounded-lg">
                                        <span className="text-xs text-purple-600 mr-1">เลือกแล้ว:</span>
                                        {filters.brand.selectedBrands.map(code => (
                                            <span
                                                key={code}
                                                onClick={() => onToggleBrandSelection(code)}
                                                className="inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded cursor-pointer hover:bg-red-100 hover:text-red-800"
                                            >
                                                {code} ×
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                    {brands.map((b) => (
                                        <label
                                            key={b.code}
                                            className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={filters.brand.selectedBrands.includes(b.code)}
                                                onChange={() => onToggleBrandSelection(b.code)}
                                                className="mr-2 rounded text-purple-600"
                                            />
                                            <span className="text-sm text-slate-900">
                                                {b.code} - {b.name_1}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
