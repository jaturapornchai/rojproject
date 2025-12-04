// components/reports/srr30003/FilterPanel.tsx
// Infinite Scroll + Search - โหลด 100 รายการแรก, scroll ลงโหลดเพิ่ม, ค้นหาโหลดใหม่

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ReportFilters, Document, Product, ProductGroup, ProductBrand, Warehouse, Shelf, FilterType } from '@/lib/reports/srr30003';

interface FilterPanelProps {
    filters: ReportFilters;
    documents: Document[];
    products: Product[];
    productGroups: ProductGroup[];
    productBrands: ProductBrand[];
    warehouses: Warehouse[];
    shelves: Shelf[];
    
    // Loading & HasMore states
    documentsLoading?: boolean;
    productsLoading?: boolean;
    productGroupsLoading?: boolean;
    productBrandsLoading?: boolean;
    warehousesLoading?: boolean;
    shelvesLoading?: boolean;
    documentsHasMore?: boolean;
    productsHasMore?: boolean;
    productGroupsHasMore?: boolean;
    productBrandsHasMore?: boolean;
    warehousesHasMore?: boolean;
    shelvesHasMore?: boolean;
    
    // Search callbacks
    onDocumentSearch?: (searchTerm: string) => void;
    onProductSearch?: (searchTerm: string) => void;
    onProductGroupSearch?: (searchTerm: string) => void;
    onProductBrandSearch?: (searchTerm: string) => void;
    onWarehouseSearch?: (searchTerm: string) => void;
    onShelfSearch?: (searchTerm: string) => void;
    
    // Load More callbacks
    onLoadMoreDocuments?: () => void;
    onLoadMoreProducts?: () => void;
    onLoadMoreProductGroups?: () => void;
    onLoadMoreProductBrands?: () => void;
    onLoadMoreWarehouses?: () => void;
    onLoadMoreShelves?: () => void;
    
    // Document Filter callbacks
    onDocumentFilterTypeChange: (type: FilterType) => void;
    onSelectedDocumentChange: (docNo: string) => void;
    onDocumentRangeStartChange: (docNo: string) => void;
    onDocumentRangeEndChange: (docNo: string) => void;
    onToggleDocumentSelection: (docNo: string) => void;
    
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
    
    // Warehouse Filter callbacks
    onWarehouseFilterTypeChange: (type: FilterType) => void;
    onSelectedWarehouseChange: (code: string) => void;
    onWarehouseRangeStartChange: (code: string) => void;
    onWarehouseRangeEndChange: (code: string) => void;
    onToggleWarehouseSelection: (code: string) => void;
    
    // Shelf Filter callbacks
    onShelfFilterTypeChange: (type: FilterType) => void;
    onSelectedShelfChange: (code: string) => void;
    onShelfRangeStartChange: (code: string) => void;
    onShelfRangeEndChange: (code: string) => void;
    onToggleShelfSelection: (code: string) => void;
    
    showDocumentFilter?: boolean;
    showProductFilter?: boolean;
    showProductGroupFilter?: boolean;
    showProductBrandFilter?: boolean;
    showWarehouseFilter?: boolean;
    showShelfFilter?: boolean;
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
    documents,
    products,
    productGroups,
    productBrands,
    warehouses,
    shelves,
    documentsLoading = false,
    productsLoading = false,
    productGroupsLoading = false,
    productBrandsLoading = false,
    warehousesLoading = false,
    shelvesLoading = false,
    documentsHasMore = false,
    productsHasMore = false,
    productGroupsHasMore = false,
    productBrandsHasMore = false,
    warehousesHasMore = false,
    shelvesHasMore = false,
    onDocumentSearch,
    onProductSearch,
    onProductGroupSearch,
    onProductBrandSearch,
    onWarehouseSearch,
    onShelfSearch,
    onLoadMoreDocuments,
    onLoadMoreProducts,
    onLoadMoreProductGroups,
    onLoadMoreProductBrands,
    onLoadMoreWarehouses,
    onLoadMoreShelves,
    onDocumentFilterTypeChange,
    onSelectedDocumentChange,
    onDocumentRangeStartChange,
    onDocumentRangeEndChange,
    onToggleDocumentSelection,
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
    onWarehouseFilterTypeChange,
    onSelectedWarehouseChange,
    onWarehouseRangeStartChange,
    onWarehouseRangeEndChange,
    onToggleWarehouseSelection,
    onShelfFilterTypeChange,
    onSelectedShelfChange,
    onShelfRangeStartChange,
    onShelfRangeEndChange,
    onToggleShelfSelection,
    showDocumentFilter = true,
    showProductFilter = true,
    showProductGroupFilter = true,
    showProductBrandFilter = true,
    showWarehouseFilter = true,
    showShelfFilter = true,
    compact = false,
}: FilterPanelProps) {
    const [documentSearch, setDocumentSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [productGroupSearch, setProductGroupSearch] = useState('');
    const [productBrandSearch, setProductBrandSearch] = useState('');
    const [warehouseSearch, setWarehouseSearch] = useState('');
    const [shelfSearch, setShelfSearch] = useState('');
    
    const [showDocumentSection, setShowDocumentSection] = useState(false);
    const [showProductSection, setShowProductSection] = useState(false);
    const [showProductGroupSection, setShowProductGroupSection] = useState(false);
    const [showProductBrandSection, setShowProductBrandSection] = useState(false);
    const [showWarehouseSection, setShowWarehouseSection] = useState(false);
    const [showShelfSection, setShowShelfSection] = useState(false);

    const documentListRef = useRef<HTMLDivElement>(null);
    const productListRef = useRef<HTMLDivElement>(null);
    const productGroupListRef = useRef<HTMLDivElement>(null);
    const productBrandListRef = useRef<HTMLDivElement>(null);
    const warehouseListRef = useRef<HTMLDivElement>(null);
    const shelfListRef = useRef<HTMLDivElement>(null);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onDocumentSearch) onDocumentSearch(documentSearch);
        }, 300);
        return () => clearTimeout(timer);
    }, [documentSearch, onDocumentSearch]);

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

    useEffect(() => {
        const timer = setTimeout(() => {
            if (onWarehouseSearch) onWarehouseSearch(warehouseSearch);
        }, 300);
        return () => clearTimeout(timer);
    }, [warehouseSearch, onWarehouseSearch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (onShelfSearch) onShelfSearch(shelfSearch);
        }, 300);
        return () => clearTimeout(timer);
    }, [shelfSearch, onShelfSearch]);

    // Scroll handlers
    const handleDocumentScroll = useCallback(() => {
        if (!documentListRef.current || documentsLoading || !documentsHasMore) return;
        const { scrollTop, scrollHeight, clientHeight } = documentListRef.current;
        if (scrollHeight - scrollTop - clientHeight < 50) {
            onLoadMoreDocuments?.();
        }
    }, [documentsLoading, documentsHasMore, onLoadMoreDocuments]);

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

    const handleWarehouseScroll = useCallback(() => {
        if (!warehouseListRef.current || warehousesLoading || !warehousesHasMore) return;
        const { scrollTop, scrollHeight, clientHeight } = warehouseListRef.current;
        if (scrollHeight - scrollTop - clientHeight < 50) {
            onLoadMoreWarehouses?.();
        }
    }, [warehousesLoading, warehousesHasMore, onLoadMoreWarehouses]);

    const handleShelfScroll = useCallback(() => {
        if (!shelfListRef.current || shelvesLoading || !shelvesHasMore) return;
        const { scrollTop, scrollHeight, clientHeight } = shelfListRef.current;
        if (scrollHeight - scrollTop - clientHeight < 50) {
            onLoadMoreShelves?.();
        }
    }, [shelvesLoading, shelvesHasMore, onLoadMoreShelves]);

    const LoadingIndicator = () => (
        <div className="flex items-center justify-center py-2 text-slate-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 mr-2"></div>
            <span className="text-sm">กำลังโหลด...</span>
        </div>
    );

    return (
        <div className={`space-y-${compact ? '4' : '6'}`}>
            {/* Document Filter */}
            {showDocumentFilter && (
                <div className="border border-slate-200 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setShowDocumentSection(!showDocumentSection)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left bg-slate-50 hover:bg-slate-100 transition-colors rounded-t-lg"
                    >
                        <span className="font-medium text-slate-900">กรองเลขที่เอกสาร</span>
                        <span className="text-slate-500">{showDocumentSection ? '▼' : '▶'}</span>
                    </button>

                    {showDocumentSection && (
                        <div className="p-4 space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {filterTypeButtons.map(({ value, label }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => onDocumentFilterTypeChange(value)}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition ${
                                            filters.document.filterType === value
                                                ? 'bg-orange-600 text-white'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {filters.document.filterType !== 'all' && (
                                <input
                                    type="text"
                                    placeholder="🔍 ค้นหาเลขที่เอกสาร..."
                                    value={documentSearch}
                                    onChange={(e) => setDocumentSearch(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                                />
                            )}

                            {filters.document.filterType === 'single' && (
                                <div ref={documentListRef} onScroll={handleDocumentScroll} className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                    {documents.map((d) => (
                                        <div key={d.doc_no} onClick={() => onSelectedDocumentChange(d.doc_no)}
                                            className={`px-3 py-2 cursor-pointer border-b border-slate-100 last:border-b-0 ${
                                                filters.document.selectedDocument === d.doc_no ? 'bg-orange-50 text-orange-700' : 'hover:bg-slate-50 text-slate-900'
                                            }`}>
                                            <span className="text-sm">{d.doc_no} - {d.cust_name}</span>
                                        </div>
                                    ))}
                                    {documentsLoading && <LoadingIndicator />}
                                    {!documentsLoading && documentsHasMore && documents.length > 0 && (
                                        <div className="text-center py-2 text-xs text-slate-400">เลื่อนลงเพื่อโหลดเพิ่ม</div>
                                    )}
                                </div>
                            )}

                            {filters.document.filterType === 'range' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div ref={documentListRef} onScroll={handleDocumentScroll} className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                        <div className="sticky top-0 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">จาก</div>
                                        {documents.map((d) => (
                                            <div key={d.doc_no} onClick={() => onDocumentRangeStartChange(d.doc_no)}
                                                className={`px-3 py-2 cursor-pointer border-b border-slate-100 last:border-b-0 ${
                                                    filters.document.rangeStart === d.doc_no ? 'bg-orange-50 text-orange-700' : 'hover:bg-slate-50 text-slate-900'
                                                }`}>
                                                <span className="text-sm">{d.doc_no}</span>
                                            </div>
                                        ))}
                                        {documentsLoading && <LoadingIndicator />}
                                    </div>
                                    <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                        <div className="sticky top-0 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">ถึง</div>
                                        {documents.map((d) => (
                                            <div key={d.doc_no} onClick={() => onDocumentRangeEndChange(d.doc_no)}
                                                className={`px-3 py-2 cursor-pointer border-b border-slate-100 last:border-b-0 ${
                                                    filters.document.rangeEnd === d.doc_no ? 'bg-orange-50 text-orange-700' : 'hover:bg-slate-50 text-slate-900'
                                                }`}>
                                                <span className="text-sm">{d.doc_no}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {filters.document.filterType === 'multiple' && (
                                <div className="space-y-2">
                                    {filters.document.selectedDocuments.length > 0 && (
                                        <div className="p-2 bg-orange-50 rounded-lg border border-orange-200">
                                            <div className="text-sm text-orange-700 font-medium mb-1">✅ เลือกแล้ว ({filters.document.selectedDocuments.length}):</div>
                                            <div className="flex flex-wrap gap-1">
                                                {filters.document.selectedDocuments.map(docNo => (
                                                    <span key={docNo} className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded cursor-pointer hover:bg-red-100 hover:text-red-800"
                                                        onClick={() => onToggleDocumentSelection(docNo)}>{docNo} ×</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div ref={documentListRef} onScroll={handleDocumentScroll} className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                        {documents.map((d) => (
                                            <label key={d.doc_no} className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0">
                                                <input type="checkbox" checked={filters.document.selectedDocuments.includes(d.doc_no)}
                                                    onChange={() => onToggleDocumentSelection(d.doc_no)} className="mr-2 rounded text-orange-600" />
                                                <span className="text-sm text-slate-900">{d.doc_no} - {d.cust_name}</span>
                                            </label>
                                        ))}
                                        {documentsLoading && <LoadingIndicator />}
                                        {!documentsLoading && documentsHasMore && documents.length > 0 && (
                                            <div className="text-center py-2 text-xs text-slate-400">เลื่อนลงเพื่อโหลดเพิ่ม</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

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

            {/* Warehouse Filter */}
            {showWarehouseFilter && (
                <div className="border border-slate-200 rounded-lg">
                    <button type="button" onClick={() => setShowWarehouseSection(!showWarehouseSection)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left bg-slate-50 hover:bg-slate-100 transition-colors rounded-t-lg">
                        <span className="font-medium text-slate-900">กรองคลัง</span>
                        <span className="text-slate-500">{showWarehouseSection ? '▼' : '▶'}</span>
                    </button>

                    {showWarehouseSection && (
                        <div className="p-4 space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {filterTypeButtons.map(({ value, label }) => (
                                    <button key={value} type="button" onClick={() => onWarehouseFilterTypeChange(value)}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition ${
                                            filters.warehouse.filterType === value ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}>{label}</button>
                                ))}
                            </div>

                            {filters.warehouse.filterType !== 'all' && (
                                <input type="text" placeholder="🔍 ค้นหาคลัง..." value={warehouseSearch}
                                    onChange={(e) => setWarehouseSearch(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900" />
                            )}

                            {filters.warehouse.filterType === 'single' && (
                                <div ref={warehouseListRef} onScroll={handleWarehouseScroll} className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                    {warehouses.map((w) => (
                                        <div key={w.code} onClick={() => onSelectedWarehouseChange(w.code)}
                                            className={`px-3 py-2 cursor-pointer border-b border-slate-100 last:border-b-0 ${
                                                filters.warehouse.selectedWarehouse === w.code ? 'bg-cyan-50 text-cyan-700' : 'hover:bg-slate-50 text-slate-900'
                                            }`}><span className="text-sm">{w.code} - {w.name_1}</span></div>
                                    ))}
                                    {warehousesLoading && <LoadingIndicator />}
                                    {!warehousesLoading && warehousesHasMore && warehouses.length > 0 && (
                                        <div className="text-center py-2 text-xs text-slate-400">เลื่อนลงเพื่อโหลดเพิ่ม</div>
                                    )}
                                </div>
                            )}

                            {filters.warehouse.filterType === 'range' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div ref={warehouseListRef} onScroll={handleWarehouseScroll} className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                        <div className="sticky top-0 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">จาก</div>
                                        {warehouses.map((w) => (
                                            <div key={w.code} onClick={() => onWarehouseRangeStartChange(w.code)}
                                                className={`px-3 py-2 cursor-pointer border-b border-slate-100 last:border-b-0 ${
                                                    filters.warehouse.rangeStart === w.code ? 'bg-cyan-50 text-cyan-700' : 'hover:bg-slate-50 text-slate-900'
                                                }`}><span className="text-sm">{w.code}</span></div>
                                        ))}
                                        {warehousesLoading && <LoadingIndicator />}
                                    </div>
                                    <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                        <div className="sticky top-0 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">ถึง</div>
                                        {warehouses.map((w) => (
                                            <div key={w.code} onClick={() => onWarehouseRangeEndChange(w.code)}
                                                className={`px-3 py-2 cursor-pointer border-b border-slate-100 last:border-b-0 ${
                                                    filters.warehouse.rangeEnd === w.code ? 'bg-cyan-50 text-cyan-700' : 'hover:bg-slate-50 text-slate-900'
                                                }`}><span className="text-sm">{w.code}</span></div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {filters.warehouse.filterType === 'multiple' && (
                                <div className="space-y-2">
                                    {filters.warehouse.selectedWarehouses.length > 0 && (
                                        <div className="p-2 bg-cyan-50 rounded-lg border border-cyan-200">
                                            <div className="text-sm text-cyan-700 font-medium mb-1">✅ เลือกแล้ว ({filters.warehouse.selectedWarehouses.length}):</div>
                                            <div className="flex flex-wrap gap-1">
                                                {filters.warehouse.selectedWarehouses.map(code => (
                                                    <span key={code} className="inline-flex items-center px-2 py-1 bg-cyan-100 text-cyan-800 text-xs rounded cursor-pointer hover:bg-red-100 hover:text-red-800"
                                                        onClick={() => onToggleWarehouseSelection(code)}>{code} ×</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div ref={warehouseListRef} onScroll={handleWarehouseScroll} className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                        {warehouses.map((w) => (
                                            <label key={w.code} className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0">
                                                <input type="checkbox" checked={filters.warehouse.selectedWarehouses.includes(w.code)}
                                                    onChange={() => onToggleWarehouseSelection(w.code)} className="mr-2 rounded text-cyan-600" />
                                                <span className="text-sm text-slate-900">{w.code} - {w.name_1}</span>
                                            </label>
                                        ))}
                                        {warehousesLoading && <LoadingIndicator />}
                                        {!warehousesLoading && warehousesHasMore && warehouses.length > 0 && (
                                            <div className="text-center py-2 text-xs text-slate-400">เลื่อนลงเพื่อโหลดเพิ่ม</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Shelf Filter */}
            {showShelfFilter && (
                <div className="border border-slate-200 rounded-lg">
                    <button type="button" onClick={() => setShowShelfSection(!showShelfSection)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left bg-slate-50 hover:bg-slate-100 transition-colors rounded-t-lg">
                        <span className="font-medium text-slate-900">กรองพื้นที่เก็บ</span>
                        <span className="text-slate-500">{showShelfSection ? '▼' : '▶'}</span>
                    </button>

                    {showShelfSection && (
                        <div className="p-4 space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {filterTypeButtons.map(({ value, label }) => (
                                    <button key={value} type="button" onClick={() => onShelfFilterTypeChange(value)}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition ${
                                            filters.shelf.filterType === value ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}>{label}</button>
                                ))}
                            </div>

                            {filters.shelf.filterType !== 'all' && (
                                <input type="text" placeholder="🔍 ค้นหาพื้นที่เก็บ..." value={shelfSearch}
                                    onChange={(e) => setShelfSearch(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900" />
                            )}

                            {filters.shelf.filterType === 'single' && (
                                <div ref={shelfListRef} onScroll={handleShelfScroll} className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                    {shelves.map((s) => (
                                        <div key={s.code} onClick={() => onSelectedShelfChange(s.code)}
                                            className={`px-3 py-2 cursor-pointer border-b border-slate-100 last:border-b-0 ${
                                                filters.shelf.selectedShelf === s.code ? 'bg-amber-50 text-amber-700' : 'hover:bg-slate-50 text-slate-900'
                                            }`}><span className="text-sm">{s.code} - {s.name_1}</span></div>
                                    ))}
                                    {shelvesLoading && <LoadingIndicator />}
                                    {!shelvesLoading && shelvesHasMore && shelves.length > 0 && (
                                        <div className="text-center py-2 text-xs text-slate-400">เลื่อนลงเพื่อโหลดเพิ่ม</div>
                                    )}
                                </div>
                            )}

                            {filters.shelf.filterType === 'range' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div ref={shelfListRef} onScroll={handleShelfScroll} className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                        <div className="sticky top-0 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">จาก</div>
                                        {shelves.map((s) => (
                                            <div key={s.code} onClick={() => onShelfRangeStartChange(s.code)}
                                                className={`px-3 py-2 cursor-pointer border-b border-slate-100 last:border-b-0 ${
                                                    filters.shelf.rangeStart === s.code ? 'bg-amber-50 text-amber-700' : 'hover:bg-slate-50 text-slate-900'
                                                }`}><span className="text-sm">{s.code}</span></div>
                                        ))}
                                        {shelvesLoading && <LoadingIndicator />}
                                    </div>
                                    <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                        <div className="sticky top-0 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">ถึง</div>
                                        {shelves.map((s) => (
                                            <div key={s.code} onClick={() => onShelfRangeEndChange(s.code)}
                                                className={`px-3 py-2 cursor-pointer border-b border-slate-100 last:border-b-0 ${
                                                    filters.shelf.rangeEnd === s.code ? 'bg-amber-50 text-amber-700' : 'hover:bg-slate-50 text-slate-900'
                                                }`}><span className="text-sm">{s.code}</span></div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {filters.shelf.filterType === 'multiple' && (
                                <div className="space-y-2">
                                    {filters.shelf.selectedShelves.length > 0 && (
                                        <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                                            <div className="text-sm text-amber-700 font-medium mb-1">✅ เลือกแล้ว ({filters.shelf.selectedShelves.length}):</div>
                                            <div className="flex flex-wrap gap-1">
                                                {filters.shelf.selectedShelves.map(code => (
                                                    <span key={code} className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded cursor-pointer hover:bg-red-100 hover:text-red-800"
                                                        onClick={() => onToggleShelfSelection(code)}>{code} ×</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div ref={shelfListRef} onScroll={handleShelfScroll} className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                        {shelves.map((s) => (
                                            <label key={s.code} className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0">
                                                <input type="checkbox" checked={filters.shelf.selectedShelves.includes(s.code)}
                                                    onChange={() => onToggleShelfSelection(s.code)} className="mr-2 rounded text-amber-600" />
                                                <span className="text-sm text-slate-900">{s.code} - {s.name_1}</span>
                                            </label>
                                        ))}
                                        {shelvesLoading && <LoadingIndicator />}
                                        {!shelvesLoading && shelvesHasMore && shelves.length > 0 && (
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
