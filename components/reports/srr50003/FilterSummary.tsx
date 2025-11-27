'use client';

// Filter Summary Component - แสดงสรุป filter ที่เลือก สำหรับ SRR50003

import type { ReportFilters, Employee, Branch } from '@/lib/reports/srr50003/types';

interface FilterSummaryProps {
    filters: ReportFilters;
    employees?: Employee[];
    branches?: Branch[];
    className?: string;
}

export function FilterSummary({ filters, employees = [], branches = [], className = '' }: FilterSummaryProps) {
    // Guard: check if filters exists
    if (!filters || !filters.employee || !filters.branch) {
        return null;
    }

    const getEmployeeName = (code: string) => {
        const employee = employees.find(e => e.code === code);
        return employee ? `${code} - ${employee.name_1}` : code;
    };

    const getBranchName = (code: string) => {
        const branch = branches.find(b => b.code === code);
        return branch ? `${code} - ${branch.name_1}` : code;
    };

    const summaryItems: { label: string; value: string }[] = [];

    // Employee Filter
    if (filters.employee.filterType !== 'all') {
        let employeeValue = '';
        switch (filters.employee.filterType) {
            case 'single':
                employeeValue = getEmployeeName(filters.employee.selectedEmployee);
                break;
            case 'range':
                employeeValue = `${filters.employee.rangeStart} - ${filters.employee.rangeEnd}`;
                break;
            case 'multiple':
                employeeValue = `${filters.employee.selectedEmployees.length} รายการ`;
                break;
        }
        summaryItems.push({ label: 'พนักงาน', value: employeeValue });
    }

    // Branch Filter
    if (filters.branch.filterType !== 'all') {
        let branchValue = '';
        switch (filters.branch.filterType) {
            case 'single':
                branchValue = getBranchName(filters.branch.selectedBranch);
                break;
            case 'range':
                branchValue = `${filters.branch.rangeStart} - ${filters.branch.rangeEnd}`;
                break;
            case 'multiple':
                branchValue = `${filters.branch.selectedBranches.length} รายการ`;
                break;
        }
        summaryItems.push({ label: 'สาขา', value: branchValue });
    }

    if (summaryItems.length === 0) {
        return null;
    }

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {summaryItems.map((item, index) => (
                <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                >
                    <span className="font-medium">{item.label}:</span>
                    <span>{item.value}</span>
                </span>
            ))}
        </div>
    );
}
