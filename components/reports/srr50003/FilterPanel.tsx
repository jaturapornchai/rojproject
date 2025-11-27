'use client';

// Filter Panel Component สำหรับ SRR50003

import { useState } from 'react';
import type { ReportFilters, Employee, Branch, FilterType } from '@/lib/reports/srr50003/types';

interface FilterPanelProps {
    filters: ReportFilters;
    employees: Employee[];
    branches: Branch[];
    onEmployeeFilterTypeChange: (type: FilterType) => void;
    onSelectedEmployeeChange: (code: string) => void;
    onEmployeeRangeStartChange: (code: string) => void;
    onEmployeeRangeEndChange: (code: string) => void;
    onToggleEmployeeSelection: (code: string) => void;
    onBranchFilterTypeChange: (type: FilterType) => void;
    onSelectedBranchChange: (code: string) => void;
    onBranchRangeStartChange: (code: string) => void;
    onBranchRangeEndChange: (code: string) => void;
    onToggleBranchSelection: (code: string) => void;
    compact?: boolean;
}

export function FilterPanel({
    filters,
    employees,
    branches,
    onEmployeeFilterTypeChange,
    onSelectedEmployeeChange,
    onEmployeeRangeStartChange,
    onEmployeeRangeEndChange,
    onToggleEmployeeSelection,
    onBranchFilterTypeChange,
    onSelectedBranchChange,
    onBranchRangeStartChange,
    onBranchRangeEndChange,
    onToggleBranchSelection,
    compact = false
}: FilterPanelProps) {
    const [showEmployeeFilter, setShowEmployeeFilter] = useState(false);
    const [showBranchFilter, setShowBranchFilter] = useState(false);
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [branchSearch, setBranchSearch] = useState('');

    // Guard: check if filters exists
    if (!filters || !filters.employee || !filters.branch) {
        return null;
    }

    const filteredEmployees = employees.filter(emp =>
        emp.code.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp.name_1.toLowerCase().includes(employeeSearch.toLowerCase())
    );

    const filteredBranches = branches.filter(branch =>
        branch.code.toLowerCase().includes(branchSearch.toLowerCase()) ||
        branch.name_1.toLowerCase().includes(branchSearch.toLowerCase())
    );

    const filterTypeButtons = [
        { value: 'all' as const, label: 'ทั้งหมด' },
        { value: 'single' as const, label: 'เลือกเดี่ยว' },
        { value: 'range' as const, label: 'ช่วง' },
        { value: 'multiple' as const, label: 'เลือกหลายรายการ' }
    ];

    return (
        <div className={`space-y-${compact ? '4' : '6'}`}>
            {/* Employee Filter */}
            <div className="border border-slate-200 rounded-lg">
                <button
                    type="button"
                    onClick={() => setShowEmployeeFilter(!showEmployeeFilter)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left bg-slate-50 hover:bg-slate-100 transition-colors rounded-t-lg"
                >
                    <span className="font-medium text-slate-900">กรองพนักงานขาย</span>
                    <span className="text-slate-500">{showEmployeeFilter ? '▼' : '▶'}</span>
                </button>

                {showEmployeeFilter && (
                    <div className="p-4 space-y-3">
                        <div className="flex flex-wrap gap-2">
                            {filterTypeButtons.map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => onEmployeeFilterTypeChange(value)}
                                    className={`px-3 py-1.5 text-sm rounded-lg transition ${
                                        filters.employee.filterType === value
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {filters.employee.filterType === 'single' && (
                            <select
                                value={filters.employee.selectedEmployee}
                                onChange={(e) => onSelectedEmployeeChange(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                            >
                                <option value="">-- เลือกพนักงาน --</option>
                                {employees.map(emp => (
                                    <option key={emp.code} value={emp.code}>
                                        {emp.code} - {emp.name_1}
                                    </option>
                                ))}
                            </select>
                        )}

                        {filters.employee.filterType === 'range' && (
                            <div className="grid grid-cols-2 gap-2">
                                <select
                                    value={filters.employee.rangeStart}
                                    onChange={(e) => onEmployeeRangeStartChange(e.target.value)}
                                    className="px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                                >
                                    <option value="">-- จาก --</option>
                                    {employees.map(emp => (
                                        <option key={emp.code} value={emp.code}>{emp.code}</option>
                                    ))}
                                </select>
                                <select
                                    value={filters.employee.rangeEnd}
                                    onChange={(e) => onEmployeeRangeEndChange(e.target.value)}
                                    className="px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                                >
                                    <option value="">-- ถึง --</option>
                                    {employees.map(emp => (
                                        <option key={emp.code} value={emp.code}>{emp.code}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {filters.employee.filterType === 'multiple' && (
                            <div>
                                <input
                                    type="text"
                                    placeholder="ค้นหาพนักงาน..."
                                    value={employeeSearch}
                                    onChange={(e) => setEmployeeSearch(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-2 text-slate-900"
                                />
                                <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg">
                                    {filteredEmployees.map(emp => (
                                        <label
                                            key={emp.code}
                                            className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={filters.employee.selectedEmployees.includes(emp.code)}
                                                onChange={() => onToggleEmployeeSelection(emp.code)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-slate-900">
                                                {emp.code} - {emp.name_1}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                <div className="mt-2 text-sm text-slate-600">
                                    เลือกแล้ว: {filters.employee.selectedEmployees.length} รายการ
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Branch Filter */}
            <div className="border border-slate-200 rounded-lg">
                <button
                    type="button"
                    onClick={() => setShowBranchFilter(!showBranchFilter)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left bg-slate-50 hover:bg-slate-100 transition-colors rounded-t-lg"
                >
                    <span className="font-medium text-slate-900">กรองสาขา</span>
                    <span className="text-slate-500">{showBranchFilter ? '▼' : '▶'}</span>
                </button>

                {showBranchFilter && (
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
                                {branches.map(branch => (
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
                                    {branches.map(branch => (
                                        <option key={branch.code} value={branch.code}>{branch.code}</option>
                                    ))}
                                </select>
                                <select
                                    value={filters.branch.rangeEnd}
                                    onChange={(e) => onBranchRangeEndChange(e.target.value)}
                                    className="px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                                >
                                    <option value="">-- ถึง --</option>
                                    {branches.map(branch => (
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
                                    {filteredBranches.map(branch => (
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
        </div>
    );
}
