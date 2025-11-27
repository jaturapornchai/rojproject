'use client';

// Filter Summary Component - แสดงสรุป filter ที่เลือก

import type { ReportFilters, Customer, Branch } from '@/lib/reports/srr40010/types';

interface FilterSummaryProps {
    filters: ReportFilters;
    customers?: Customer[];
    branches?: Branch[];
    className?: string;
}

export function FilterSummary({ filters, customers = [], branches = [], className = '' }: FilterSummaryProps) {
    const getCustomerName = (code: string) => {
        const customer = customers.find(c => c.code === code);
        return customer ? `${code} - ${customer.name_1}` : code;
    };

    const getBranchName = (code: string) => {
        const branch = branches.find(b => b.code === code);
        return branch ? `${code} - ${branch.name_1}` : code;
    };

    const summaryItems: { label: string; value: string }[] = [];

    // Sale Type
    if (filters.saleType !== 'all') {
        summaryItems.push({
            label: 'ประเภทการขาย',
            value: filters.saleType === 'backend' ? 'ขายหลังร้าน' : 'ขาย POS'
        });
    }

    // Diff Filter
    if (filters.diffFilter !== '0') {
        const diffLabels: Record<string, string> = {
            '1': 'เฉพาะค่าบวก',
            '2': 'เฉพาะค่าลบ',
            '3': 'แสดงทุกรายการ'
        };
        summaryItems.push({
            label: 'ผลต่าง',
            value: diffLabels[filters.diffFilter] || 'ทั้งหมด'
        });
    }

    // Customer Filter
    if (filters.customer.filterType !== 'all') {
        let customerValue = '';
        switch (filters.customer.filterType) {
            case 'single':
                customerValue = getCustomerName(filters.customer.selectedCustomer);
                break;
            case 'range':
                customerValue = `${filters.customer.rangeStart} - ${filters.customer.rangeEnd}`;
                break;
            case 'multiple':
                customerValue = `${filters.customer.selectedCustomers.length} รายการ`;
                break;
        }
        summaryItems.push({ label: 'ลูกค้า', value: customerValue });
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
