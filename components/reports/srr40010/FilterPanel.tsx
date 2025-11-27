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
    const [showCustomerSection, setShowCustomerSection] = useState(false);
    const [showBranchSection, setShowBranchSection] = useState(false);

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

    const filterTypeButtons = [
        { value: 'all' as const, label: 'ทั้งหมด' },
        { value: 'single' as const, label: 'เลือกเดี่ยว' },
        { value: 'range' as const, label: 'ช่วง' },
        { value: 'multiple' as const, label: 'เลือกหลายรายการ' }
    ];

    return (
        <div className={`space-y-${compact ? '4' : '6'}`}>
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
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
                <div className="border border-slate-200 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setShowCustomerSection(!showCustomerSection)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left bg-slate-50 hover:bg-slate-100 transition-colors rounded-t-lg"
                    >
                        <span className="font-medium text-slate-900">กรองลูกค้า</span>
                        <span className="text-slate-500">{showCustomerSection ? '▼' : '▶'}</span>
                    </button>

                    {showCustomerSection && (
                        <div className="p-4 space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {filterTypeButtons.map(({ value, label }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => onCustomerFilterTypeChange(value)}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition ${
                                            filters.customer.filterType === value
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {filters.customer.filterType === 'single' && (
                                <select
                                    value={filters.customer.selectedCustomer}
                                    onChange={(e) => onSelectedCustomerChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
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
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        value={filters.customer.rangeStart}
                                        onChange={(e) => onCustomerRangeStartChange(e.target.value)}
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                                    >
                                        <option value="">-- จาก --</option>
                                        {customers.map((cust) => (
                                            <option key={cust.code} value={cust.code}>{cust.code}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={filters.customer.rangeEnd}
                                        onChange={(e) => onCustomerRangeEndChange(e.target.value)}
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                                    >
                                        <option value="">-- ถึง --</option>
                                        {customers.map((cust) => (
                                            <option key={cust.code} value={cust.code}>{cust.code}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {filters.customer.filterType === 'multiple' && (
                                <div>
                                    <input
                                        type="text"
                                        placeholder="ค้นหาลูกค้า..."
                                        value={customerSearch}
                                        onChange={(e) => setCustomerSearch(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-2 text-slate-900"
                                    />
                                    <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg">
                                        {filteredCustomers.map((cust) => (
                                            <label
                                                key={cust.code}
                                                className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={filters.customer.selectedCustomers.includes(cust.code)}
                                                    onChange={() => onToggleCustomerSelection(cust.code)}
                                                    className="mr-2"
                                                />
                                                <span className="text-sm text-slate-900">
                                                    {cust.code} - {cust.name_1}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="mt-2 text-sm text-slate-600">
                                        เลือกแล้ว: {filters.customer.selectedCustomers.length} รายการ
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Branch Filter */}
            {showBranchFilter && (
                <div className="border border-slate-200 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setShowBranchSection(!showBranchSection)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left bg-slate-50 hover:bg-slate-100 transition-colors rounded-t-lg"
                    >
                        <span className="font-medium text-slate-900">กรองสาขา</span>
                        <span className="text-slate-500">{showBranchSection ? '▼' : '▶'}</span>
                    </button>

                    {showBranchSection && (
                        <div className="p-4 space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {filterTypeButtons.map(({ value, label }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => onBranchFilterTypeChange(value)}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition ${
                                            filters.branch.filterType === value
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {filters.branch.filterType === 'single' && (
                                <select
                                    value={filters.branch.selectedBranch}
                                    onChange={(e) => onSelectedBranchChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
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
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        value={filters.branch.rangeStart}
                                        onChange={(e) => onBranchRangeStartChange(e.target.value)}
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                                    >
                                        <option value="">-- จาก --</option>
                                        {branches.map((branch) => (
                                            <option key={branch.code} value={branch.code}>{branch.code}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={filters.branch.rangeEnd}
                                        onChange={(e) => onBranchRangeEndChange(e.target.value)}
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                                    >
                                        <option value="">-- ถึง --</option>
                                        {branches.map((branch) => (
                                            <option key={branch.code} value={branch.code}>{branch.code}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {filters.branch.filterType === 'multiple' && (
                                <div>
                                    <input
                                        type="text"
                                        placeholder="ค้นหาสาขา..."
                                        value={branchSearch}
                                        onChange={(e) => setBranchSearch(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-2 text-slate-900"
                                    />
                                    <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg">
                                        {filteredBranches.map((branch) => (
                                            <label
                                                key={branch.code}
                                                className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={filters.branch.selectedBranches.includes(branch.code)}
                                                    onChange={() => onToggleBranchSelection(branch.code)}
                                                    className="mr-2"
                                                />
                                                <span className="text-sm text-slate-900">
                                                    {branch.code} - {branch.name_1}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="mt-2 text-sm text-slate-600">
                                        เลือกแล้ว: {filters.branch.selectedBranches.length} รายการ
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
