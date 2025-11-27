# Developer Guide - ระบบรายงานวิเคราะห์ขาดทุน

## 📋 สารบัญ
- [โครงสร้างโปรเจ็กต์](#โครงสร้างโปรเจ็กต์)
- [การเพิ่มรายงานใหม่ (5 Phases)](#การเพิ่มรายงานใหม่-5-phases)
  - [Phase 1: Shared Module](#phase-1-shared-module-librportsreportid)
  - [Phase 2: Custom Hooks](#phase-2-custom-hooks-hooksreportsreportid)
  - [Phase 3: Shared Components](#phase-3-shared-components-componentsreportsreportid)
  - [Phase 4: Main Report Page](#phase-4-main-report-page)
  - [Phase 5: Schedule Management Page](#phase-5-schedule-management-page)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [PDF Configuration](#pdf-configuration)
- [Permissions & Security](#permissions--security)
- [Error Handling](#error-handling)
- [Testing](#testing)

## 🏗️ โครงสร้างโปรเจ็กต์

```
app/
├── reports/                        # หน้ารายงาน
│   └── srrXXXXX/                   # รายงาน
│       ├── page.tsx                # หน้ารายงานหลัก (Phase 4)
│       └── schedules/              
│           └── page.tsx            # หน้าตั้งเวลาส่งอีเมล (Phase 5)
├── api/                            # API Routes
│   ├── generate-report/            # สร้างรายงาน
│   ├── get-pdf/                    # สร้าง PDF
│   ├── mongodb/                    # MongoDB operations
│   └── process-schedule/           # ส่งรายงานตามตารางเวลา
│
components/
└── reports/
    └── srrXXXXX/                   # Shared Components (Phase 3)
        ├── FilterPanel.tsx         # UI สำหรับกรองข้อมูล
        ├── DatePresetButtons.tsx   # ปุ่ม preset วันที่
        ├── MonthYearSelector.tsx   # เลือกเดือน/ปี
        ├── FilterSummary.tsx       # แสดงสรุป filter ที่เลือก
        └── index.ts                # Re-export all components
│
hooks/
└── reports/
    └── srrXXXXX/                   # Custom Hooks (Phase 2)
        ├── useReportFilters.ts     # State management สำหรับ filters
        ├── useDateRange.ts         # State management สำหรับ date range
        ├── useMasterData.ts        # Fetch master data (customers, branches)
        └── index.ts                # Re-export all hooks
│
lib/
└── reports/
    └── srrXXXXX/                   # Shared Module (Phase 1)
        ├── types.ts                # TypeScript interfaces
        ├── config.ts               # Constants และ default values
        ├── query-builder.ts        # Functions สำหรับสร้าง query
        └── index.ts                # Re-export all modules
```

## ➕ การเพิ่มรายงานใหม่ (5 Phases)

การเพิ่มรายงานใหม่ใช้หลักการ **Shared Modules** เพื่อให้ code สามารถ reuse ได้ระหว่างหน้ารายงานหลัก (`page.tsx`) และหน้าตั้งเวลาส่งอีเมล (`schedules/page.tsx`)

### ข้อดีของ Architecture นี้:
- ✅ **Single Source of Truth** - Query template อยู่ที่เดียว แก้ไขครั้งเดียว
- ✅ **Reusable Components** - Filter UI ใช้ร่วมกันได้
- ✅ **Type Safety** - TypeScript types แชร์กันทั้งโปรเจ็กต์
- ✅ **Maintainability** - แยก concerns ชัดเจน

---

### Phase 1: Shared Module (`lib/reports/[REPORT_ID]/`)

สร้างโฟลเดอร์สำหรับ shared logic:

```bash
mkdir -p lib/reports/srrXXXXX
```

#### 1.1 สร้าง `types.ts` - TypeScript Interfaces

```typescript
// lib/reports/srrXXXXX/types.ts

// Master data types
export interface Customer {
    ar_id: string;
    ar_name: string;
}

export interface Branch {
    branch_id: string;
    branch_name: string;
}

// Filter types
export type FilterType = 'all' | 'single' | 'range' | 'multiple';

export interface CustomerFilterState {
    filterType: FilterType;
    selectedCustomer: string;
    rangeStart: string;
    rangeEnd: string;
    selectedCustomers: string[];
}

export interface BranchFilterState {
    filterType: FilterType;
    selectedBranch: string;
    rangeStart: string;
    rangeEnd: string;
    selectedBranches: string[];
}

export interface ReportFilters {
    customer: CustomerFilterState;
    branch: BranchFilterState;
    diffFilter: 'all' | 'positive' | 'negative';
    saleType: string;
}

// Query config types
export interface QueryConfig {
    startDate: Date | null;
    endDate: Date | null;
    filters: ReportFilters;
}

// PDF config types
export interface PdfConfig {
    shopid: string;
    guid: string;
    pdf_config: {
        title: string;
        description: string;
        orientation: 'L' | 'P';
        page_size: string;
    };
    layout_config: {
        schema_version: number;
        styles: Record<string, unknown>;
        sections: Array<{ alias: string; row_type: string; columns: Array<{ field: string }> }>;
        column_schema: Record<string, unknown>;
    };
}

// Email schedule types
export interface EmailSchedule {
    shopid: string;
    reportid: string;
    schedule_id: string;
    schedule_name: string;
    report_name: string;
    enabled: boolean;
    date_preset: string;
    filter_config?: string; // JSON string of ReportFilters
    days_of_week: number[];
    times: string[];
    timezone: string;
    recipients: string[];
    cc_recipients?: string[];
    email_subject: string;
    include_pdf: boolean;
    query_config: Record<string, unknown>;
    pdf_config: Record<string, unknown>;
    created_at?: string;
    updated_at?: string;
}

// Preset types
export interface DatePreset {
    value: string;
    label: string;
}

export interface DayOfWeek {
    value: number;
    label: string;
}
```

#### 1.2 สร้าง `config.ts` - Constants และ Default Values

```typescript
// lib/reports/srrXXXXX/config.ts

import type { DatePreset, DayOfWeek, ReportFilters } from './types';

// Report identification
export const REPORT_ID = 'SRRXXXXX';
export const REPORT_NAME = 'ชื่อรายงาน (SRRXXXXX)';

// Base SQL Query Template - แก้ไขที่นี่ที่เดียว!
export const BASE_QUERY_TEMPLATE = `
SELECT
    field1 as "ฟิลด์1",
    field2 as "ฟิลด์2",
    -- ... more fields
FROM your_table
WHERE 1=1
    AND doc_date BETWEEN '{{startDate}}' AND '{{endDate}}'
    {{customerFilter}}
    {{branchFilter}}
    {{additionalFilters}}
ORDER BY field1
`;

// Column schema for PDF
export const COLUMN_SCHEMA = {
    "ฟิลด์1": {
        label: "ป้ายกำกับ1",
        flex: 10,
        align: "L",
        data_type: "string"
    },
    "ฟิลด์2": {
        label: "ป้ายกำกับ2",
        flex: 10,
        align: "R",
        data_type: "number",
        format: "#,##0.00"
    }
};

// Date presets for schedule
export const DATE_PRESETS: DatePreset[] = [
    { value: 'today', label: 'วันนี้' },
    { value: 'yesterday', label: 'เมื่อวาน' },
    { value: 'this_week', label: 'สัปดาห์นี้' },
    { value: 'last_week', label: 'สัปดาห์ที่แล้ว' },
    { value: 'this_month', label: 'เดือนนี้' },
    { value: 'last_month', label: 'เดือนที่แล้ว' },
];

// Days of week
export const DAYS_OF_WEEK: DayOfWeek[] = [
    { value: 0, label: 'อาทิตย์' },
    { value: 1, label: 'จันทร์' },
    { value: 2, label: 'อังคาร' },
    { value: 3, label: 'พุธ' },
    { value: 4, label: 'พฤหัสบดี' },
    { value: 5, label: 'ศุกร์' },
    { value: 6, label: 'เสาร์' },
];

// Thai months
export const THAI_MONTHS = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
    'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
    'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

// Default values
export const getDefaultReportFilters = (): ReportFilters => ({
    customer: {
        filterType: 'all',
        selectedCustomer: '',
        rangeStart: '',
        rangeEnd: '',
        selectedCustomers: [],
    },
    branch: {
        filterType: 'all',
        selectedBranch: '',
        rangeStart: '',
        rangeEnd: '',
        selectedBranches: [],
    },
    diffFilter: 'all',
    saleType: 'all',
});
```

#### 1.3 สร้าง `query-builder.ts` - Functions สำหรับสร้าง Query

```typescript
// lib/reports/srrXXXXX/query-builder.ts

import { SHOP_ID_PUBLIC } from '@/lib/constants';
import { BASE_QUERY_TEMPLATE, COLUMN_SCHEMA, REPORT_NAME, THAI_MONTHS } from './config';
import type { ReportFilters, QueryConfig, PdfConfig } from './types';

// Format date for SQL
export const formatDateForQuery = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Format date for Thai display
export const formatThaiDate = (date: Date | null): string => {
    if (!date) return '';
    const day = date.getDate();
    const month = THAI_MONTHS[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
};

// Build customer filter SQL
export const buildCustomerFilter = (filters: ReportFilters): string => {
    const { customer } = filters;
    switch (customer.filterType) {
        case 'single':
            return customer.selectedCustomer
                ? `AND ar_id = '${customer.selectedCustomer}'`
                : '';
        case 'range':
            return customer.rangeStart && customer.rangeEnd
                ? `AND ar_id BETWEEN '${customer.rangeStart}' AND '${customer.rangeEnd}'`
                : '';
        case 'multiple':
            return customer.selectedCustomers.length > 0
                ? `AND ar_id IN ('${customer.selectedCustomers.join("','")}')`
                : '';
        default:
            return '';
    }
};

// Build branch filter SQL
export const buildBranchFilter = (filters: ReportFilters): string => {
    const { branch } = filters;
    switch (branch.filterType) {
        case 'single':
            return branch.selectedBranch
                ? `AND branch_id = '${branch.selectedBranch}'`
                : '';
        case 'range':
            return branch.rangeStart && branch.rangeEnd
                ? `AND branch_id BETWEEN '${branch.rangeStart}' AND '${branch.rangeEnd}'`
                : '';
        case 'multiple':
            return branch.selectedBranches.length > 0
                ? `AND branch_id IN ('${branch.selectedBranches.join("','")}')`
                : '';
        default:
            return '';
    }
};

// Build complete query
export const buildQuery = (config: QueryConfig): string => {
    const { startDate, endDate, filters } = config;
    
    let query = BASE_QUERY_TEMPLATE
        .replace('{{startDate}}', formatDateForQuery(startDate))
        .replace('{{endDate}}', formatDateForQuery(endDate))
        .replace('{{customerFilter}}', buildCustomerFilter(filters))
        .replace('{{branchFilter}}', buildBranchFilter(filters))
        .replace('{{additionalFilters}}', ''); // เพิ่ม filters อื่นๆ ตามต้องการ
    
    return query;
};

// Build PDF config
export const buildPdfConfig = (guid: string, startDate: Date | null, endDate: Date | null): PdfConfig => {
    return {
        shopid: SHOP_ID_PUBLIC,
        guid,
        pdf_config: {
            title: REPORT_NAME,
            description: `ตั้งแต่วันที่ ${formatThaiDate(startDate)} ถึงวันที่ ${formatThaiDate(endDate)}`,
            orientation: 'L',
            page_size: 'A4',
        },
        layout_config: {
            schema_version: 1,
            styles: {},
            sections: [{
                alias: "report_data",
                row_type: "detail",
                columns: Object.keys(COLUMN_SCHEMA).map(field => ({ field }))
            }],
            column_schema: COLUMN_SCHEMA,
        }
    };
};

// Calculate date from preset
export const calculateDateFromPreset = (preset: string): { startDate: Date; endDate: Date } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (preset) {
        case 'today':
            return { startDate: new Date(today), endDate: new Date(today) };
        case 'yesterday': {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return { startDate: yesterday, endDate: yesterday };
        }
        case 'this_week': {
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            return { startDate: startOfWeek, endDate: new Date(today) };
        }
        case 'last_week': {
            const startOfLastWeek = new Date(today);
            startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
            const endOfLastWeek = new Date(startOfLastWeek);
            endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
            return { startDate: startOfLastWeek, endDate: endOfLastWeek };
        }
        case 'this_month': {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            return { startDate: startOfMonth, endDate: new Date(today) };
        }
        case 'last_month': {
            const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            return { startDate: startOfLastMonth, endDate: endOfLastMonth };
        }
        default:
            return { startDate: new Date(today), endDate: new Date(today) };
    }
};

// Serialize filters to JSON string (for storing in DB)
export const serializeFilters = (filters: ReportFilters): string => {
    return JSON.stringify(filters);
};

// Deserialize filters from JSON string
export const deserializeFilters = (json: string): ReportFilters => {
    try {
        return JSON.parse(json);
    } catch {
        return getDefaultReportFilters();
    }
};

// Import at top
import { getDefaultReportFilters } from './config';
```

#### 1.4 สร้าง `index.ts` - Re-export ทุก Module

```typescript
// lib/reports/srrXXXXX/index.ts

export * from './types';
export * from './config';
export * from './query-builder';
```

---

### Phase 2: Custom Hooks (`hooks/reports/[REPORT_ID]/`)

สร้าง hooks สำหรับจัดการ state:

```bash
mkdir -p hooks/reports/srrXXXXX
```

#### 2.1 สร้าง `useReportFilters.ts`

```typescript
// hooks/reports/srrXXXXX/useReportFilters.ts

import { useState, useCallback } from 'react';
import { getDefaultReportFilters, type ReportFilters, type FilterType } from '@/lib/reports/srrXXXXX';

export const useReportFilters = () => {
    const [filters, setFilters] = useState<ReportFilters>(getDefaultReportFilters());

    // Customer filter actions
    const setCustomerFilterType = useCallback((type: FilterType) => {
        setFilters(prev => ({
            ...prev,
            customer: { ...prev.customer, filterType: type }
        }));
    }, []);

    const setSelectedCustomer = useCallback((customerId: string) => {
        setFilters(prev => ({
            ...prev,
            customer: { ...prev.customer, selectedCustomer: customerId }
        }));
    }, []);

    const toggleCustomerSelection = useCallback((customerId: string) => {
        setFilters(prev => {
            const current = prev.customer.selectedCustomers;
            const updated = current.includes(customerId)
                ? current.filter(id => id !== customerId)
                : [...current, customerId];
            return {
                ...prev,
                customer: { ...prev.customer, selectedCustomers: updated }
            };
        });
    }, []);

    // Branch filter actions (similar pattern)
    const setBranchFilterType = useCallback((type: FilterType) => {
        setFilters(prev => ({
            ...prev,
            branch: { ...prev.branch, filterType: type }
        }));
    }, []);

    // ... more actions

    const resetAllFilters = useCallback(() => {
        setFilters(getDefaultReportFilters());
    }, []);

    return {
        filters,
        setFilters,
        setCustomerFilterType,
        setSelectedCustomer,
        toggleCustomerSelection,
        setBranchFilterType,
        // ... more
        resetAllFilters,
    };
};
```

#### 2.2 สร้าง `useDateRange.ts`

```typescript
// hooks/reports/srrXXXXX/useDateRange.ts

import { useState, useCallback } from 'react';

export const useDateRange = (defaultStart?: Date, defaultEnd?: Date) => {
    const [startDate, setStartDate] = useState<Date | null>(defaultStart || null);
    const [endDate, setEndDate] = useState<Date | null>(defaultEnd || null);

    const handlePreset = useCallback((preset: string) => {
        // Use calculateDateFromPreset from query-builder
        const { startDate: start, endDate: end } = calculateDateFromPreset(preset);
        setStartDate(start);
        setEndDate(end);
    }, []);

    const handleMonthSelect = useCallback((month: number, year: number) => {
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0);
        setStartDate(start);
        setEndDate(end);
    }, []);

    return {
        startDate,
        endDate,
        setStartDate,
        setEndDate,
        handlePreset,
        handleMonthSelect,
    };
};
```

#### 2.3 สร้าง `useMasterData.ts`

```typescript
// hooks/reports/srrXXXXX/useMasterData.ts

import { useState, useEffect, useCallback } from 'react';
import { SHOP_ID_PUBLIC } from '@/lib/constants';
import type { Customer, Branch } from '@/lib/reports/srrXXXXX';

export const useMasterData = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchCustomers = useCallback(async () => {
        try {
            const response = await fetch('/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopid: SHOP_ID_PUBLIC,
                    limit: 1000,
                    query_items: [{
                        alias: 'customers',
                        query: 'SELECT ar_id, ar_name FROM customer_table ORDER BY ar_id'
                    }]
                })
            });
            const data = await response.json();
            if (data.success && data.data?.customers?.detail) {
                setCustomers(data.data.customers.detail);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    }, []);

    const fetchBranches = useCallback(async () => {
        // Similar to fetchCustomers
    }, []);

    useEffect(() => {
        fetchCustomers();
        fetchBranches();
    }, [fetchCustomers, fetchBranches]);

    return {
        customers,
        branches,
        loading,
        refetchCustomers: fetchCustomers,
        refetchBranches: fetchBranches,
    };
};
```

#### 2.4 สร้าง `index.ts`

```typescript
// hooks/reports/srrXXXXX/index.ts

export * from './useReportFilters';
export * from './useDateRange';
export * from './useMasterData';
```

---

### Phase 3: Shared Components (`components/reports/[REPORT_ID]/`)

สร้าง UI components ที่ใช้ร่วมกัน:

```bash
mkdir -p components/reports/srrXXXXX
```

#### 3.1 สร้าง `FilterPanel.tsx`

```typescript
// components/reports/srrXXXXX/FilterPanel.tsx

'use client';

import type { ReportFilters, Customer, Branch, FilterType } from '@/lib/reports/srrXXXXX';

interface FilterPanelProps {
    filters: ReportFilters;
    customers: Customer[];
    branches: Branch[];
    onCustomerFilterTypeChange: (type: FilterType) => void;
    onSelectedCustomerChange: (id: string) => void;
    onToggleCustomerSelection: (id: string) => void;
    onBranchFilterTypeChange: (type: FilterType) => void;
    // ... more callbacks
    compact?: boolean; // สำหรับ schedule page
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
    filters,
    customers,
    branches,
    onCustomerFilterTypeChange,
    // ...
    compact = false,
}) => {
    return (
        <div className={compact ? 'space-y-4' : 'space-y-6'}>
            {/* Customer Filter Section */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    กรองลูกค้า
                </label>
                <div className="flex gap-2 mb-2">
                    {(['all', 'single', 'range', 'multiple'] as FilterType[]).map(type => (
                        <button
                            key={type}
                            onClick={() => onCustomerFilterTypeChange(type)}
                            className={`px-3 py-1.5 text-sm rounded-lg transition ${
                                filters.customer.filterType === type
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            {type === 'all' ? 'ทั้งหมด' : type}
                        </button>
                    ))}
                </div>
                
                {/* Conditional inputs based on filterType */}
                {filters.customer.filterType === 'single' && (
                    <select
                        value={filters.customer.selectedCustomer}
                        onChange={(e) => onSelectedCustomerChange(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                        <option value="">-- เลือกลูกค้า --</option>
                        {customers.map(c => (
                            <option key={c.ar_id} value={c.ar_id}>
                                {c.ar_id} - {c.ar_name}
                            </option>
                        ))}
                    </select>
                )}
                {/* ... more filter types */}
            </div>

            {/* Branch Filter Section - similar structure */}
            {/* Additional Filters */}
        </div>
    );
};
```

#### 3.2 สร้าง `FilterSummary.tsx`

```typescript
// components/reports/srrXXXXX/FilterSummary.tsx

'use client';

import type { ReportFilters, Customer, Branch } from '@/lib/reports/srrXXXXX';

interface FilterSummaryProps {
    filters: ReportFilters;
    customers: Customer[];
    branches: Branch[];
    className?: string;
}

export const FilterSummary: React.FC<FilterSummaryProps> = ({
    filters,
    customers,
    branches,
    className = '',
}) => {
    const summaryItems: string[] = [];
    
    // Customer summary
    if (filters.customer.filterType !== 'all') {
        if (filters.customer.filterType === 'single' && filters.customer.selectedCustomer) {
            const customer = customers.find(c => c.ar_id === filters.customer.selectedCustomer);
            summaryItems.push(`ลูกค้า: ${customer?.ar_name || filters.customer.selectedCustomer}`);
        }
        // ... more cases
    }

    if (summaryItems.length === 0) return null;

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {summaryItems.map((item, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {item}
                </span>
            ))}
        </div>
    );
};
```

#### 3.3 สร้าง `DatePresetButtons.tsx` และ `MonthYearSelector.tsx`

```typescript
// components/reports/srrXXXXX/DatePresetButtons.tsx
// components/reports/srrXXXXX/MonthYearSelector.tsx
// ... สร้าง UI components ตามต้องการ
```

#### 3.4 สร้าง `index.ts`

```typescript
// components/reports/srrXXXXX/index.ts

export * from './FilterPanel';
export * from './FilterSummary';
export * from './DatePresetButtons';
export * from './MonthYearSelector';
```

---

### Phase 4: Main Report Page

สร้างหน้ารายงานหลักโดยใช้ shared modules:

```typescript
// app/reports/srrXXXXX/page.tsx

'use client';

import { useState } from 'react';
import ThaiDatePicker from '@/components/ThaiDatePicker';
import { SHOP_ID_PUBLIC } from '@/lib/constants';

// Import shared modules
import {
    REPORT_ID,
    REPORT_NAME,
    buildQuery,
    buildPdfConfig,
    formatThaiDate,
} from '@/lib/reports/srrXXXXX';

import { useReportFilters, useDateRange, useMasterData } from '@/hooks/reports/srrXXXXX';
import { FilterPanel, DatePresetButtons, MonthYearSelector } from '@/components/reports/srrXXXXX';

export default function ReportPage() {
    const [loading, setLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Use shared hooks
    const { customers, branches } = useMasterData();
    const { startDate, endDate, setStartDate, setEndDate, handlePreset, handleMonthSelect } = useDateRange();
    const {
        filters,
        setCustomerFilterType,
        setSelectedCustomer,
        toggleCustomerSelection,
        setBranchFilterType,
        // ... more
        resetAllFilters,
    } = useReportFilters();

    const handleGenerateReport = async () => {
        if (!startDate || !endDate) {
            setError('กรุณาเลือกช่วงวันที่');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Use shared query builder
            const query = buildQuery({ startDate, endDate, filters });

            const reportRes = await fetch('/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopid: SHOP_ID_PUBLIC,
                    limit: 5000,
                    query_items: [{
                        alias: 'report_data',
                        query,
                        summary_config: { /* ... */ }
                    }]
                })
            });

            const reportData = await reportRes.json();

            if (reportData?.success && reportData.guid) {
                // Use shared PDF config builder
                const pdfConfig = buildPdfConfig(reportData.guid, startDate, endDate);
                
                const pdfRes = await fetch('/api/get-pdf', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(pdfConfig)
                });

                if (pdfRes.ok) {
                    const blob = await pdfRes.blob();
                    setPdfUrl(URL.createObjectURL(blob));
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <h1>{REPORT_NAME}</h1>
            </header>

            {/* Date Selection */}
            <section>
                <DatePresetButtons onPresetSelect={handlePreset} />
                <MonthYearSelector onMonthSelect={handleMonthSelect} />
                <ThaiDatePicker value={startDate} onChange={setStartDate} />
                <ThaiDatePicker value={endDate} onChange={setEndDate} />
            </section>

            {/* Filters - use shared component */}
            <section>
                <FilterPanel
                    filters={filters}
                    customers={customers}
                    branches={branches}
                    onCustomerFilterTypeChange={setCustomerFilterType}
                    onSelectedCustomerChange={setSelectedCustomer}
                    onToggleCustomerSelection={toggleCustomerSelection}
                    onBranchFilterTypeChange={setBranchFilterType}
                    // ... more callbacks
                />
            </section>

            {/* Actions */}
            <button onClick={handleGenerateReport} disabled={loading}>
                {loading ? 'กำลังสร้างรายงาน...' : 'ดูรายงาน'}
            </button>

            {/* PDF Display */}
            {pdfUrl && <iframe src={pdfUrl} className="w-full h-screen" />}
        </main>
    );
}
```

---

### Phase 5: Schedule Management Page

สร้างหน้าจัดการตารางส่งอีเมล:

```typescript
// app/reports/srrXXXXX/schedules/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SHOP_ID_PUBLIC } from '@/lib/constants';

// Import shared modules
import {
    REPORT_ID,
    REPORT_NAME,
    DATE_PRESETS,
    DAYS_OF_WEEK,
    buildQuery,
    buildPdfConfig,
    calculateDateFromPreset,
    serializeFilters,
    deserializeFilters,
    type EmailSchedule,
} from '@/lib/reports/srrXXXXX';

import { useReportFilters, useMasterData } from '@/hooks/reports/srrXXXXX';
import { FilterPanel, FilterSummary } from '@/components/reports/srrXXXXX';

export default function ScheduleManagement() {
    const [schedules, setSchedules] = useState<EmailSchedule[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [showFilterPanel, setShowFilterPanel] = useState(false);

    // Use shared hooks
    const { customers, branches } = useMasterData();
    const { filters, setFilters, resetAllFilters, ...filterActions } = useReportFilters();

    const [formData, setFormData] = useState({
        schedule_name: '',
        enabled: true,
        date_preset: 'today',
        days_of_week: [1, 2, 3, 4, 5],
        times: ['09:00'],
        recipients: [] as string[],
        // ...
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Build query with selected preset and filters
        const { startDate, endDate } = calculateDateFromPreset(formData.date_preset);
        const query = buildQuery({ startDate, endDate, filters });
        const pdfConfig = buildPdfConfig('{{guid}}', startDate, endDate);

        const payload = {
            collection: 'email_schedules',
            filter: { shopid: SHOP_ID_PUBLIC, reportid: REPORT_ID, schedule_id: '...' },
            data: {
                ...formData,
                filter_config: serializeFilters(filters), // ⭐ เก็บ filter config
                query_config: { /* ... */ },
                pdf_config: pdfConfig,
            },
            upsert: true,
        };

        await fetch('/api/mongodb/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    };

    const handleEdit = (schedule: EmailSchedule) => {
        // Load filter config when editing
        if (schedule.filter_config) {
            setFilters(deserializeFilters(schedule.filter_config));
        }
        // ... load other form data
    };

    return (
        <main>
            {/* Header with back link */}
            <header>
                <Link href={`/reports/${REPORT_ID.toLowerCase()}`}>← กลับ</Link>
                <h1>ตารางการส่งอีเมล - {REPORT_ID}</h1>
            </header>

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit}>
                    {/* Date Preset Selection */}
                    <select
                        value={formData.date_preset}
                        onChange={(e) => setFormData({ ...formData, date_preset: e.target.value })}
                    >
                        {DATE_PRESETS.map(preset => (
                            <option key={preset.value} value={preset.value}>
                                {preset.label}
                            </option>
                        ))}
                    </select>

                    {/* Filter Panel Toggle */}
                    <button type="button" onClick={() => setShowFilterPanel(!showFilterPanel)}>
                        🔍 ตัวกรองรายงาน
                    </button>
                    
                    <FilterSummary filters={filters} customers={customers} branches={branches} />
                    
                    {showFilterPanel && (
                        <FilterPanel
                            filters={filters}
                            customers={customers}
                            branches={branches}
                            compact={true}
                            {...filterActions}
                        />
                    )}

                    {/* Days of Week */}
                    <div className="flex gap-2">
                        {DAYS_OF_WEEK.map(day => (
                            <button
                                key={day.value}
                                type="button"
                                onClick={() => toggleDayOfWeek(day.value)}
                                className={formData.days_of_week.includes(day.value) ? 'selected' : ''}
                            >
                                {day.label}
                            </button>
                        ))}
                    </div>

                    {/* ... more form fields */}
                </form>
            )}

            {/* Schedules List */}
            <div>
                {schedules.map(schedule => (
                    <div key={schedule.schedule_id}>
                        <h3>{schedule.schedule_name}</h3>
                        
                        {/* ⭐ แสดง Filter Summary ถ้ามี */}
                        {schedule.filter_config && (
                            <FilterSummary
                                filters={deserializeFilters(schedule.filter_config)}
                                customers={customers}
                                branches={branches}
                            />
                        )}
                        
                        <button onClick={() => handleEdit(schedule)}>แก้ไข</button>
                    </div>
                ))}
            </div>
        </main>
    );
}
```

---

## 🎯 สรุป Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Pages (Phase 4 & 5)                     │
│  ┌─────────────────────┐    ┌─────────────────────────────┐    │
│  │  page.tsx           │    │  schedules/page.tsx         │    │
│  │  (Main Report)      │    │  (Schedule Management)      │    │
│  └──────────┬──────────┘    └──────────────┬──────────────┘    │
└─────────────┼──────────────────────────────┼────────────────────┘
              │                              │
              ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Components (Phase 3)                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│  │FilterPanel │ │DatePreset  │ │MonthYear   │ │FilterSumry │   │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
└─────────────────────────────────────────────────────────────────┘
              │                              │
              ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Hooks (Phase 2)                             │
│  ┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐     │
│  │useReportFilters  │ │useDateRange  │ │useMasterData     │     │
│  └──────────────────┘ └──────────────┘ └──────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
              │                              │
              ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Lib Module (Phase 1)                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────────────────────┐   │
│  │ types.ts   │ │ config.ts  │ │ query-builder.ts           │   │
│  │ interfaces │ │ constants  │ │ buildQuery, buildPdfConfig │   │
│  └────────────┘ └────────────┘ └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 🔌 API Endpoints

### `/api/generate-report`
**วัตถุประสงค์**: สร้างและดึงข้อมูลรายงาน

**Request Body:**
```typescript
{
    shopid: string;
    limit?: number;
    offset?: number;
    query_items: Array<{
        alias: string;
        query: string;
        summary_config?: {
            levels: Array<{
                group_by_fields: string[];
                sum_fields: string[];
                typejson: number;
            }>;
            grand_total?: boolean;
            grand_total_type?: number;
        };
    }>;
}
```

**Response:**
```typescript
{
    success: boolean;
    message?: string;
    guid?: string;
    detailRowCount?: number;
    data?: Record<string, {
        detail?: Record<string, unknown>[];
        summary?: Array<{
            linenumber?: number;
            level?: number;
            typejson?: number;
            data?: Record<string, unknown>;
        }>;
    }>;
}
```

### `/api/get-pdf`
**วัตถุประสงค์**: แปลงข้อมูลรายงานเป็น PDF

**Request Body:**
```typescript
{
    shopid: string;
    guid: string;
    pdf_config: {
        title: string;
        description: string;
        orientation: "L" | "P";
        page_size: "A4" | "A3" | "Letter";
        title_align?: "C" | "L" | "R";
        description_align?: "C" | "L" | "R";
    };
    layout_config: {
        schema_version: number;
        styles?: {
            header?: StyleConfig;
            detail?: StyleConfig;
            summary?: StyleConfig;
            level_1?: StyleConfig;
        };
        sections: Array<{
            alias: string;
            row_type: "detail" | "summary";
            columns: Array<{ field: string }>;
        }>;
        column_schema: Record<string, ColumnConfig>;
    };
}
```

### `/api/mongodb/get`
**วัตถุประสงค์**: ดึงข้อมูลจาก MongoDB

**Request Body:**
```typescript
{
    collection: string;
    filter: Record<string, any>;
    sort?: Record<string, 1 | -1>;
    limit?: number;
}
```

### `/api/mongodb/update`
**วัตถุประสงค์**: อัปเดต/เพิ่มข้อมูลใน MongoDB

**Request Body:**
```typescript
{
    collection: string;
    filter: Record<string, any>;
    data: Record<string, any>;
    upsert?: boolean;
}
```

## 🗄️ Database Schema

### MongoDB Collections

#### `report_access_logs`
```typescript
{
    shopid: string;
    email: string;
    report_name: string;
    conditions: string;
    created_at: string;
    updated_at: string;
}
```

#### Report Schedules (สำหรับการส่งอัตโนมัติ)
```typescript
{
    shopid: string;
    report_name: string;
    email_list: string[];
    schedule_config: {
        frequency: "daily" | "weekly" | "monthly";
        day_of_week?: number; // 0-6 for weekly
        day_of_month?: number; // 1-31 for monthly
        time: string; // HH:mm format
    };
    conditions: string; // ช่วงวันที่หรือเงื่อนไข
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
```

## 📄 PDF Configuration

### Column Schema Types
```typescript
// ข้อมูลทั่วไป
"field_name": {
    label: "ป้ายกำกับที่แสดง",
    flex: 10, // ความกว้างสัมพัทธ์
    align: "L" | "C" | "R", // จัดชิดซ้าย, กลาง, ขวา
    data_type: "string" | "number" | "date",
    format?: string; // รูปแบบการแสดงผล
    use_buddhist_year?: boolean; // ใช้ปี พ.ศ. สำหรับวันที่
    text_color_negative?: string; // สีข้อความเมื่อเป็นค่าติดลบ
}
```

### Style Configurations
```typescript
"styles": {
    "use_fill": false,
    "header": {
        "background": "#FFFFFF",
        "text": "#000000",
        "border": "#000000",
        "font_weight": "bold"
    },
    "detail": {
        "background": "#FFFFFF",
        "text": "#000000",
        "border": "#E0E0E0"
    },
    "summary": {
        "background": "#F5F5F5",
        "text": "#000000",
        "border": "#000000",
        "font_weight": "bold"
    }
}
```

## 🔐 Permissions & Security

### User Session Structure
```typescript
interface UserSession {
    user: {
        email: string;
        isAdmin?: boolean;
        allowed_reports?: string[]; // ['SRR40001', 'SRRXXXXX']
    };
}
```

### Access Control Pattern
```typescript
// ตรวจสอบสิทธิ์การเข้าถึงรายงาน
const isAdmin = session?.user?.isAdmin;
const allowedReports = (session?.user as any)?.allowed_reports || [];
const hasAccess = isAdmin || allowedReports.includes('REPORT_CODE');

if (!hasAccess) {
    router.push('/');
    return;
}
```

### วิธีเพิ่มสิทธิ์ให้ผู้ใช้
1. เพิ่มรหัสรายงานใน `allowed_reports` array ของผู้ใช้
2. หรือตั้งค่า `isAdmin: true` สำหรับผู้ดูแลระบบ

## 🚨 Error Handling

### Client-Side Error Handling
```typescript
const handleGenerateResult = async () => {
    setError(null);
    
    if (!startDate || !endDate) {
        setError('กรุณาเลือกช่วงเวลา');
        return;
    }

    try {
        const response = await fetch('/api/generate-report', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            setError(errorData?.error || 'เกิดข้อผิดพลาด');
            return;
        }

        const result = await response.json();
        if (!result.success) {
            setError(result?.error || result?.message || 'ไม่สามารถสร้างรายงานได้');
            return;
        }

        // ดำเนินการต่อ...
    } catch (error: any) {
        console.error('Error:', error);
        setError(error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
};
```

### API Error Response Format
```typescript
{
    success: false,
    error: "ข้อความแสดงข้อผิดพลาด",
    details?: any,
    status?: number,
    guid?: string
}
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] ทดสอบการเลือกช่วงวันที่
- [ ] ทดสอบปุ่ม preset date ranges
- [ ] ทดสอบการสร้างรายงาน
- [ ] ทดสอบการแสดงผล PDF
- [ ] ทดสอบการจัดการ error cases
- [ ] ทดสอบสิทธิ์การเข้าถึง
- [ ] ทดสอบการบันทึก log

### Debug Configuration
```bash
# เปิด debug mode
DEBUG=true
NEXT_PUBLIC_DEBUG=true

# Backend URL (local development)
BACKEND_URL=http://localhost:8108/v1
```

## 🛠️ Common Development Tasks

### เพิ่มคอลัมน์ใหม่ในรายงาน
1. อัปเดต SQL query ในหน้ารายงาน
2. เพิ่ง column definition ใน `column_schema`
3. ทดสอบการแสดงผล

### เปลี่ยนการจัดเรียงข้อมูล
```typescript
// ใน SQL query
order by field1, field2

// หรือใน summary_config
sum_fields: ["field1", "field2"]
group_by_fields: ["field1"]
```

### เพิ่มการคำนวณใหม่
```typescript
// ใน SQL query
(field1 * field2) as "ผลลัพธ์"
sum(field1) over() as "รวมทั้งหมด"
```

### สร้างรายงานที่มีหลาย sections
```typescript
query_items: [
    {
        alias: "section1",
        query: "SELECT ...",
        summary_config: { /* config */ }
    },
    {
        alias: "section2", 
        query: "SELECT ...",
        summary_config: { /* config */ }
    }
]

// ใน layout_config.sections
sections: [
    { alias: "section1", columns: [...] },
    { alias: "section2", columns: [...] }
]
```

## 📝 Best Practices

1. **SQL Query**: ใช้ parameterized queries และตรวจสอบ SQL injection
2. **Error Messages**: ใช้ข้อความที่เข้าใจง่ายสำหรับผู้ใช้
3. **Performance**: จำกัดจำนวนรายการด้วย `limit`
4. **Security**: ตรวจสอบสิทธิ์การเข้าถึงทุกครั้ง
5. **Logging**: บันทึกการใช้งานรายงานเสมอ
6. **Testing**: ทดสอบกับข้อมูลจริงและ edge cases

## 🚀 Deployment Notes

1. ตรวจสอบ environment variables
2. อัปเดต `BACKEND_URL` สำหรับ production
3. ตรวจสอบ MongoDB connection
4. ทดสอบ PDF generation ใน production environment

## 📞 Support

หากพบปัญหาหรือต้องการความช่วยเหลือ:
- ตรวจสอบ console logs
- ดู API response details
- ตรวจสอบ network requests
- ทดสอบใน development environment ก่อน