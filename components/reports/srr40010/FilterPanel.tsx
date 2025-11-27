'use client';

// Filter Panel Component สำหรับ SRR40010
// ใช้ร่วมกันระหว่างหน้าหลักและหน้า Schedule

import { useState } from 'react';
import type { 
    Customer, 
    Branch, 
    ReportFilters,
    FilterType,
    DiffFilterType,
    SaleType
} from '@/lib/reports/srr40010/types';

interface FilterPanelProps {
    filters: ReportFilters;
    customers: Customer[];
    branches: Branch[];
    
    // Customer Filter callbacks
    onCustomerFilterTypeChange: (type: FilterType) => void;
    onSelectedCustomerChange: (code: string) => void;
    onCustomerRangeStartChange: (code: string) => void;
    onCustomerRangeEndChange: (code: string) => void;
    onToggleCustomerSelection: (code: string) => void;
    
    // Branch Filter callbacks
    onBranchFilterTypeChange: (type: FilterType) => void;
    onSelectedBranchChange: (code: string) => void;
    onBranchRangeStartChange: (code: string) => void;
    onBranchRangeEndChange: (code: string) => void;
    onToggleBranchSelection: (code: string) => void;
    
    // Other Filter callbacks
    onDiffFilterChange: (filter: DiffFilterType) => void;
    onSaleTypeChange: (type: SaleType) => void;
    
    // Optional: แสดงหรือซ่อนส่วนต่างๆ
    showSaleType?: boolean;
    showDiffFilter?: boolean;
    showCustomerFilter?: boolean;
    showBranchFilter?: boolean;
    
    // Compact mode สำหรับ schedule form
    compact?: boolean;
}

export function FilterPanel({
    filters,
    customers,
    branches,
    onCustomerFilterTypeChange,
    onSelectedCustomerChange,
    onCustomerRangeStartChange,
    onCustomerRangeEndChange,
    onToggleCustomerSelection,
    onBranchFilterTypeChange,
    onSelectedBranchChange,
    onBranchRangeStartChange,
    onBranchRangeEndChange,
    onToggleBranchSelection,
    onDiffFilterChange,
    onSaleTypeChange,
    showSaleType = true,
    showDiffFilter = true,
    showCustomerFilter = true,
    showBranchFilter = true,
    compact = false
}: FilterPanelProps) {
    const [customerSearch, setCustomerSearch] = useState('');
    const [branchSearch, setBranchSearch] = useState('');
    const [showCustomerSection, setShowCustomerSection] = useState(!compact);
    const [showBranchSection, setShowBranchSection] = useState(!compact);

    // Filter customers by search
    const filteredCustomers = customers.filter(cust => {
        const searchLower = customerSearch.toLowerCase();
        return cust.code.toLowerCase().includes(searchLower) ||
               cust.name_1.toLowerCase().includes(searchLower);
    });

    // Filter branches by search
    const filteredBranches = branches.filter(branch => {
        const searchLower = branchSearch.toLowerCase();
        return branch.code.toLowerCase().includes(searchLower) ||
               branch.name_1.toLowerCase().includes(searchLower);
    });

    const filterTypeLabels: Record<FilterType, string> = {
        'all': 'ทั้งหมด',
        'single': 'เลือก 1 รายการ',
        'range': 'ช่วง',
        'multiple': 'เลือกหลายรายการ'
    };

    return (
        <div className={`space-y-6 ${compact ? 'text-sm' : ''}`}>
            {/* Sale Type & Diff Filter */}
            {(showSaleType || showDiffFilter) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {showSaleType && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">📦 ประเภทการขาย</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { value: 'all', label: 'แสดงขายทั้งหมด' },
                                    { value: 'backend', label: 'ขายหลังร้าน' },
                                    { value: 'pos', label: 'ขาย POS' }
                                ].map(({ value, label }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => onSaleTypeChange(value as SaleType)}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition ${
                                            filters.saleType === value 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {showDiffFilter && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">📊 แสดงผลต่าง</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { value: '0', label: 'แสดงทั้งหมด' },
                                    { value: '1', label: 'เฉพาะค่าบวก' },
                                    { value: '2', label: 'เฉพาะค่าลบ' }
                                ].map(({ value, label }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => onDiffFilterChange(value as DiffFilterType)}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition ${
                                            filters.diffFilter === value 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Customer Filter */}
            {showCustomerFilter && (
                <div className="border-t border-slate-200 pt-6">
                    <button
                        type="button"
                        onClick={() => setShowCustomerSection(!showCustomerSection)}
                        className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 transition-transform ${showCustomerSection ? 'rotate-180' : ''}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                        🧑‍💼 ลูกค้า
                        {filters.customer.filterType !== 'all' && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {filters.customer.filterType === 'single' ? '1 รายการ' : 
                                 filters.customer.filterType === 'range' ? 'ช่วง' : 
                                 `${filters.customer.selectedCustomers.length} รายการ`}
                            </span>
                        )}
                    </button>

                    {showCustomerSection && (
                        <div className="mt-3 space-y-4 bg-slate-50 p-4 rounded-lg">
                            <div className="flex flex-wrap gap-2">
                                {(['all', 'single', 'range', 'multiple'] as const).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => onCustomerFilterTypeChange(type)}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition ${
                                            filters.customer.filterType === type
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        {filterTypeLabels[type]}
                                    </button>
                                ))}
                            </div>

                            {filters.customer.filterType === 'single' && (
                                <select
                                    value={filters.customer.selectedCustomer}
                                    onChange={(e) => onSelectedCustomerChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                    <option value="">-- เลือกลูกค้า --</option>
                                    {customers.map((cust) => (
                                        <option key={cust.code} value={cust.code}>
                                            {cust.code} - {cust.name_1}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {filters.customer.filterType === 'range' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <select
                                        value={filters.customer.rangeStart}
                                        onChange={(e) => onCustomerRangeStartChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    >
                                        <option value="">-- ตั้งแต่ --</option>
                                        {customers.map((cust) => (
                                            <option key={cust.code} value={cust.code}>
                                                {cust.code} - {cust.name_1}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={filters.customer.rangeEnd}
                                        onChange={(e) => onCustomerRangeEndChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    >
                                        <option value="">-- ถึง --</option>
                                        {customers.map((cust) => (
                                            <option key={cust.code} value={cust.code}>
                                                {cust.code} - {cust.name_1}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {filters.customer.filterType === 'multiple' && (
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        placeholder="ค้นหาลูกค้า..."
                                        value={customerSearch}
                                        onChange={(e) => setCustomerSearch(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg bg-white">
                                        {filteredCustomers.map((cust) => (
                                            <label
                                                key={cust.code}
                                                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={filters.customer.selectedCustomers.includes(cust.code)}
                                                    onChange={() => onToggleCustomerSelection(cust.code)}
                                                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-slate-700">
                                                    {cust.code} - {cust.name_1}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    {filters.customer.selectedCustomers.length > 0 && (
                                        <p className="text-xs text-slate-500">
                                            เลือกแล้ว {filters.customer.selectedCustomers.length} รายการ
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Branch Filter */}
            {showBranchFilter && (
                <div className="border-t border-slate-200 pt-6">
                    <button
                        type="button"
                        onClick={() => setShowBranchSection(!showBranchSection)}
                        className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 transition-transform ${showBranchSection ? 'rotate-180' : ''}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                        🏢 สาขา
                        {filters.branch.filterType !== 'all' && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {filters.branch.filterType === 'single' ? '1 รายการ' : 
                                 filters.branch.filterType === 'range' ? 'ช่วง' : 
                                 `${filters.branch.selectedBranches.length} รายการ`}
                            </span>
                        )}
                    </button>

                    {showBranchSection && (
                        <div className="mt-3 space-y-4 bg-slate-50 p-4 rounded-lg">
                            <div className="flex flex-wrap gap-2">
                                {(['all', 'single', 'range', 'multiple'] as const).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => onBranchFilterTypeChange(type)}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition ${
                                            filters.branch.filterType === type
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        {filterTypeLabels[type]}
                                    </button>
                                ))}
                            </div>

                            {filters.branch.filterType === 'single' && (
                                <select
                                    value={filters.branch.selectedBranch}
                                    onChange={(e) => onSelectedBranchChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                    <option value="">-- เลือกสาขา --</option>
                                    {branches.map((branch) => (
                                        <option key={branch.code} value={branch.code}>
                                            {branch.code} - {branch.name_1}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {filters.branch.filterType === 'range' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <select
                                        value={filters.branch.rangeStart}
                                        onChange={(e) => onBranchRangeStartChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    >
                                        <option value="">-- ตั้งแต่ --</option>
                                        {branches.map((branch) => (
                                            <option key={branch.code} value={branch.code}>
                                                {branch.code} - {branch.name_1}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={filters.branch.rangeEnd}
                                        onChange={(e) => onBranchRangeEndChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    >
                                        <option value="">-- ถึง --</option>
                                        {branches.map((branch) => (
                                            <option key={branch.code} value={branch.code}>
                                                {branch.code} - {branch.name_1}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {filters.branch.filterType === 'multiple' && (
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        placeholder="ค้นหาสาขา..."
                                        value={branchSearch}
                                        onChange={(e) => setBranchSearch(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg bg-white">
                                        {filteredBranches.map((branch) => (
                                            <label
                                                key={branch.code}
                                                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={filters.branch.selectedBranches.includes(branch.code)}
                                                    onChange={() => onToggleBranchSelection(branch.code)}
                                                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-slate-700">
                                                    {branch.code} - {branch.name_1}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    {filters.branch.selectedBranches.length > 0 && (
                                        <p className="text-xs text-slate-500">
                                            เลือกแล้ว {filters.branch.selectedBranches.length} รายการ
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
