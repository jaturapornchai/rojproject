// components/reports/srr20011/FilterPanel.tsx
// Infinite Scroll + Search - โหลด 100 รายการแรก, scroll ลงโหลดเพิ่ม, ค้นหาโหลดใหม่

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ReportFilters, Product, ProductGroup, ProductBrand, FilterType } from '@/lib/reports/srr20011';

interface FilterPanelProps {
    filters: ReportFilters;
    products: Product[];
    productGroups: ProductGroup[];
    productBrands: ProductBrand[];
    
    // Loading & HasMore states
    productsLoading?: boolean;
    productGroupsLoading?: boolean;
    productBrandsLoading?: boolean;
    productsHasMore?: boolean;
    productGroupsHasMore?: boolean;
    productBrandsHasMore?: boolean;
    
    // Search callbacks
    onProductSearch?: (searchTerm: string) => void;
    onProductGroupSearch?: (searchTerm: string) => void;
    onProductBrandSearch?: (searchTerm: string) => void;
    
    // Load More callbacks
    onLoadMoreProducts?: () => void;
    onLoadMoreProductGroups?: () => void;
    onLoadMoreProductBrands?: () => void;
    
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
    
    showProductFilter?: boolean;
    showProductGroupFilter?: boolean;
    showProductBrandFilter?: boolean;
    compact?: boolean;
}

const filterTypeButtons = [
    { value: 'all' as const, label: 'ทั้งหมด' },
    { value: 'single' as const, label: 'เลือกเดี่ยว' },
    { value: 'range' as const, label: 'ช่วง' },
    { value: 'multiple' as const, label: 'เลือกหลายรายการ' }
];

export function FilterPanel({
    filters,
    products,
    productGroups,
    productBrands,
    productsLoading = false,
    productGroupsLoading = false,
    productBrandsLoading = false,
    productsHasMore = false,
    productGroupsHasMore = false,
    productBrandsHasMore = false,
    onProductSearch,
    onProductGroupSearch,
    onProductBrandSearch,
    onLoadMoreProducts,
    onLoadMoreProductGroups,
    onLoadMoreProductBrands,
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
    compact = false,
}: FilterPanelProps) {
    const [productSearch, setProductSearch] = useState('');
    const [productGroupSearch, setProductGroupSearch] = useState('');
    const [productBrandSearch, setProductBrandSearch] = useState('');
    const [showProductSection, setShowProductSection] = useState(false);
    const [showProductGroupSection, setShowProductGroupSection] = useState(false);
    const [showProductBrandSection, setShowProductBrandSection] = useState(false);

    const productListRef = useRef<HTMLDivElement>(null);
    const productGroupListRef = useRef<HTMLDivElement>(null);
    const productBrandListRef = useRef<HTMLDivElement>(null);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onProductSearch) onProductSearch(productSearch);
        }, 300);
        return () => clearTimeout(timer);
    }, [productSearch, onProductSearch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (onProductGroupSearch) onProductGroupSearch(productGroupSearch);
        }, 300);
        return () => clearTimeout(timer);
    }, [productGroupSearch, onProductGroupSearch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (onProductBrandSearch) onProductBrandSearch(productBrandSearch);
        }, 300);
        return () => clearTimeout(timer);
    }, [productBrandSearch, onProductBrandSearch]);

    // Scroll handlers
    const handleProductScroll = useCallback(() => {
        if (!productListRef.current || productsLoading || !productsHasMore) return;
        const { scrollTop, scrollHeight, clientHeight } = productListRef.current;
        if (scrollHeight - scrollTop - clientHeight < 50) {
            onLoadMoreProducts?.();
        }
    }, [productsLoading, productsHasMore, onLoadMoreProducts]);

    const handleProductGroupScroll = useCallback(() => {
        if (!productGroupListRef.current || productGroupsLoading || !productGroupsHasMore) return;
        const { scrollTop, scrollHeight, clientHeight } = productGroupListRef.current;
        if (scrollHeight - scrollTop - clientHeight < 50) {
            onLoadMoreProductGroups?.();
        }
    }, [productGroupsLoading, productGroupsHasMore, onLoadMoreProductGroups]);

    const handleProductBrandScroll = useCallback(() => {
        if (!productBrandListRef.current || productBrandsLoading || !productBrandsHasMore) return;
        const { scrollTop, scrollHeight, clientHeight } = productBrandListRef.current;
        if (scrollHeight - scrollTop - clientHeight < 50) {
            onLoadMoreProductBrands?.();
        }
    }, [productBrandsLoading, productBrandsHasMore, onLoadMoreProductBrands]);

    const LoadingIndicator = () => (
        <div className="flex items-center justify-center py-2 text-slate-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 mr-2"></div>
            <span className="text-sm">กำลังโหลด...</span>
        </div>
    );

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
                        <span className="font-medium text-slate-900">กรองสินค้า</span>
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
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {filters.product.filterType !== 'all' && (
                                <input
                                    type="text"
                                    placeholder="🔍 ค้นหาสินค้า..."
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                                />
                            )}

                            {filters.product.filterType === 'single' && (
                                <div ref={productListRef} onScroll={handleProductScroll} className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                    {products.map((p) => (
                                        <div key={p.code} onClick={() => onSelectedProductChange(p.code)}
                                            className={`px-3 py-2 cursor-pointer border-b border-slate-100 last:border-b-0 ${
                                                filters.product.selectedProduct === p.code ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50 text-slate-900'
                                            }`}>
                                            <span className="text-sm">{p.code} - {p.name_1}</span>
                                        </div>
                                    ))}
                                    {productsLoading && <LoadingIndicator />}
                                    {!productsLoading && productsHasMore && products.length > 0 && (
                                        <div className="text-center py-2 text-xs text-slate-400">เลื่อนลงเพื่อโหลดเพิ่ม</div>
                                    )}
                                </div>
                            )}

                            {filters.product.filterType === 'range' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div ref={productListRef} onScroll={handleProductScroll} className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                        <div className="sticky top-0 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">จาก</div>
                                        {products.map((p) => (
                                            <div key={p.code} onClick={() => onProductRangeStartChange(p.code)}
                                                className={`px-3 py-2 cursor-pointer border-b border-slate-100 last:border-b-0 ${
                                                    filters.product.rangeStart === p.code ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50 text-slate-900'
                                                }`}>
                                                <span className="text-sm">{p.code}</span>
                                            </div>
                                        ))}
                                        {productsLoading && <LoadingIndicator />}
                                    </div>
                                    <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                        <div className="sticky top-0 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">ถึง</div>
                                        {products.map((p) => (
                                            <div key={p.code} onClick={() => onProductRangeEndChange(p.code)}
                                                className={`px-3 py-2 cursor-pointer border-b border-slate-100 last:border-b-0 ${
                                                    filters.product.rangeEnd === p.code ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50 text-slate-900'
                                                }`}>
                                                <span className="text-sm">{p.code}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {filters.product.filterType === 'multiple' && (
                                <div className="space-y-2">
                                    {filters.product.selectedProducts.length > 0 && (
                                        <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                                            <div className="text-sm text-emerald-700 font-medium mb-1">✅ เลือกแล้ว ({filters.product.selectedProducts.length}):</div>
                                            <div className="flex flex-wrap gap-1">
                                                {filters.product.selectedProducts.map(code => (
                                                    <span key={code} className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded cursor-pointer hover:bg-red-100 hover:text-red-800"
                                                        onClick={() => onToggleProductSelection(code)}>{code} ×</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div ref={productListRef} onScroll={handleProductScroll} className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                        {products.map((p) => (
                                            <label key={p.code} className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0">
                                                <input type="checkbox" checked={filters.product.selectedProducts.includes(p.code)}
                                                    onChange={() => onToggleProductSelection(p.code)} className="mr-2 rounded text-emerald-600" />
                                                <span className="text-sm text-slate-900">{p.code} - {p.name_1}</span>
                                            </label>
                                        ))}
                                        {productsLoading && <LoadingIndicator />}
                                        {!productsLoading && productsHasMore && products.length > 0 && (
                                            <div className="text-center py-2 text-xs text-slate-400">เลื่อนลงเพื่อโหลดเพิ่ม</div>
                                        )}
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
                    <button type="button" onClick={() => setShowProductGroupSection(!showProductGroupSection)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left bg-slate-50 hover:bg-slate-100 transition-colors rounded-t-lg">
                        <span className="font-medium text-slate-900">กรองกลุ่มสินค้า</span>
                        <span className="text-slate-500">{showProductGroupSection ? '▼' : '▶'}</span>
                    </button>

                    {showProductGroupSection && (
                        <div className="p-4 space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {filterTypeButtons.map(({ value, label }) => (
                                    <button key={value} type="button" onClick={() => onProductGroupFilterTypeChange(value)}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition ${
                                            filters.productGroup.filterType === value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}>{label}</button>
                                ))}
                            </div>

                            {filters.productGroup.filterType !== 'all' && (
                                <input type="text" placeholder="🔍 ค้นหากลุ่มสินค้า..." value={productGroupSearch}
                                    onChange={(e) => setProductGroupSearch(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900" />
                            )}

                            {filters.productGroup.filterType === 'single' && (
                                <div ref={productGroupListRef} onScroll={handleProductGroupScroll} className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                    {productGroups.map((g) => (
                                        <div key={g.code} onClick={() => onSelectedProductGroupChange(g.code)}
                                            className={`px-3 py-2 cursor-pointer border-b border-slate-100 last:border-b-0 ${
                                                filters.productGroup.selectedGroup === g.code ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-900'
                                            }`}><span className="text-sm">{g.code} - {g.name_1}</span></div>
                                    ))}
                                    {productGroupsLoading && <LoadingIndicator />}
                                    {!productGroupsLoading && productGroupsHasMore && productGroups.length > 0 && (
                                        <div className="text-center py-2 text-xs text-slate-400">เลื่อนลงเพื่อโหลดเพิ่ม</div>
                                    )}
                                </div>
                            )}

                            {filters.productGroup.filterType === 'range' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div ref={productGroupListRef} onScroll={handleProductGroupScroll} className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                        <div className="sticky top-0 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">จาก</div>
                                        {productGroups.map((g) => (
                                            <div key={g.code} onClick={() => onProductGroupRangeStartChange(g.code)}
                                                className={`px-3 py-2 cursor-pointer border-b border-slate-100 last:border-b-0 ${
                                                    filters.productGroup.rangeStart === g.code ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-900'
                                                }`}><span className="text-sm">{g.code}</span></div>
                                        ))}
                                        {productGroupsLoading && <LoadingIndicator />}
                                    </div>
                                    <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                        <div className="sticky top-0 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">ถึง</div>
                                        {productGroups.map((g) => (
                                            <div key={g.code} onClick={() => onProductGroupRangeEndChange(g.code)}
                                                className={`px-3 py-2 cursor-pointer border-b border-slate-100 last:border-b-0 ${
                                                    filters.productGroup.rangeEnd === g.code ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-900'
                                                }`}><span className="text-sm">{g.code}</span></div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {filters.productGroup.filterType === 'multiple' && (
                                <div className="space-y-2">
                                    {filters.productGroup.selectedGroups.length > 0 && (
                                        <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="text-sm text-blue-700 font-medium mb-1">✅ เลือกแล้ว ({filters.productGroup.selectedGroups.length}):</div>
                                            <div className="flex flex-wrap gap-1">
                                                {filters.productGroup.selectedGroups.map(code => (
                                                    <span key={code} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded cursor-pointer hover:bg-red-100 hover:text-red-800"
                                                        onClick={() => onToggleProductGroupSelection(code)}>{code} ×</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div ref={productGroupListRef} onScroll={handleProductGroupScroll} className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                        {productGroups.map((g) => (
                                            <label key={g.code} className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0">
                                                <input type="checkbox" checked={filters.productGroup.selectedGroups.includes(g.code)}
                                                    onChange={() => onToggleProductGroupSelection(g.code)} className="mr-2 rounded text-blue-600" />
                                                <span className="text-sm text-slate-900">{g.code} - {g.name_1}</span>
                                            </label>
                                        ))}
                                        {productGroupsLoading && <LoadingIndicator />}
                                        {!productGroupsLoading && productGroupsHasMore && productGroups.length > 0 && (
                                            <div className="text-center py-2 text-xs text-slate-400">เลื่อนลงเพื่อโหลดเพิ่ม</div>
                                        )}
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
                    <button type="button" onClick={() => setShowProductBrandSection(!showProductBrandSection)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left bg-slate-50 hover:bg-slate-100 transition-colors rounded-t-lg">
                        <span className="font-medium text-slate-900">กรองยี่ห้อสินค้า</span>
                        <span className="text-slate-500">{showProductBrandSection ? '▼' : '▶'}</span>
                    </button>

                    {showProductBrandSection && (
                        <div className="p-4 space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {filterTypeButtons.map(({ value, label }) => (
                                    <button key={value} type="button" onClick={() => onProductBrandFilterTypeChange(value)}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition ${
                                            filters.productBrand.filterType === value ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}>{label}</button>
                                ))}
                            </div>

                            {filters.productBrand.filterType !== 'all' && (
                                <input type="text" placeholder="🔍 ค้นหายี่ห้อสินค้า..." value={productBrandSearch}
                                    onChange={(e) => setProductBrandSearch(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900" />
                            )}

                            {filters.productBrand.filterType === 'single' && (
                                <div ref={productBrandListRef} onScroll={handleProductBrandScroll} className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                    {productBrands.map((b) => (
                                        <div key={b.code} onClick={() => onSelectedProductBrandChange(b.code)}
                                            className={`px-3 py-2 cursor-pointer border-b border-slate-100 last:border-b-0 ${
                                                filters.productBrand.selectedBrand === b.code ? 'bg-purple-50 text-purple-700' : 'hover:bg-slate-50 text-slate-900'
                                            }`}><span className="text-sm">{b.code} - {b.name_1}</span></div>
                                    ))}
                                    {productBrandsLoading && <LoadingIndicator />}
                                    {!productBrandsLoading && productBrandsHasMore && productBrands.length > 0 && (
                                        <div className="text-center py-2 text-xs text-slate-400">เลื่อนลงเพื่อโหลดเพิ่ม</div>
                                    )}
                                </div>
                            )}

                            {filters.productBrand.filterType === 'range' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div ref={productBrandListRef} onScroll={handleProductBrandScroll} className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                        <div className="sticky top-0 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">จาก</div>
                                        {productBrands.map((b) => (
                                            <div key={b.code} onClick={() => onProductBrandRangeStartChange(b.code)}
                                                className={`px-3 py-2 cursor-pointer border-b border-slate-100 last:border-b-0 ${
                                                    filters.productBrand.rangeStart === b.code ? 'bg-purple-50 text-purple-700' : 'hover:bg-slate-50 text-slate-900'
                                                }`}><span className="text-sm">{b.code}</span></div>
                                        ))}
                                        {productBrandsLoading && <LoadingIndicator />}
                                    </div>
                                    <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                        <div className="sticky top-0 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">ถึง</div>
                                        {productBrands.map((b) => (
                                            <div key={b.code} onClick={() => onProductBrandRangeEndChange(b.code)}
                                                className={`px-3 py-2 cursor-pointer border-b border-slate-100 last:border-b-0 ${
                                                    filters.productBrand.rangeEnd === b.code ? 'bg-purple-50 text-purple-700' : 'hover:bg-slate-50 text-slate-900'
                                                }`}><span className="text-sm">{b.code}</span></div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {filters.productBrand.filterType === 'multiple' && (
                                <div className="space-y-2">
                                    {filters.productBrand.selectedBrands.length > 0 && (
                                        <div className="p-2 bg-purple-50 rounded-lg border border-purple-200">
                                            <div className="text-sm text-purple-700 font-medium mb-1">✅ เลือกแล้ว ({filters.productBrand.selectedBrands.length}):</div>
                                            <div className="flex flex-wrap gap-1">
                                                {filters.productBrand.selectedBrands.map(code => (
                                                    <span key={code} className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded cursor-pointer hover:bg-red-100 hover:text-red-800"
                                                        onClick={() => onToggleProductBrandSelection(code)}>{code} ×</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div ref={productBrandListRef} onScroll={handleProductBrandScroll} className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                        {productBrands.map((b) => (
                                            <label key={b.code} className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0">
                                                <input type="checkbox" checked={filters.productBrand.selectedBrands.includes(b.code)}
                                                    onChange={() => onToggleProductBrandSelection(b.code)} className="mr-2 rounded text-purple-600" />
                                                <span className="text-sm text-slate-900">{b.code} - {b.name_1}</span>
                                            </label>
                                        ))}
                                        {productBrandsLoading && <LoadingIndicator />}
                                        {!productBrandsLoading && productBrandsHasMore && productBrands.length > 0 && (
                                            <div className="text-center py-2 text-xs text-slate-400">เลื่อนลงเพื่อโหลดเพิ่ม</div>
                                        )}
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
