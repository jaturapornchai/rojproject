// Query Builder สำหรับ SRR50003 - รายงานสรุปยอดขายประจำวัน

import { SHOP_ID_PUBLIC } from '@/lib/constants';
import {
    BASE_QUERY_TEMPLATE,
    DEFAULT_SUMMARY_CONFIG,
    COLUMN_SCHEMA,
    PDF_STYLES,
    THAI_MONTHS
} from './config';
import type {
    EmployeeFilterState,
    BranchFilterState,
    ReportFilters,
    QueryConfig,
    PdfConfig
} from './types';

// ===== Date Utilities =====

/**
 * แปลงวันที่เป็น format YYYY-MM-DD สำหรับ SQL
 */
export const formatDateForQuery = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * แปลงวันที่เป็น format ไทย DD/MM/YYYY (พ.ศ.)
 */
export const formatThaiDate = (date: Date | null): string => {
    if (!date) return '';
    const thaiYear = date.getFullYear() + 543;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${thaiYear}`;
};

/**
 * แปลงวันที่เป็น format ไทยแบบเต็ม (DD เดือน BBBB)
 */
export const formatThaiDateLong = (date: Date | null): string => {
    if (!date) return '';
    const day = date.getDate();
    const month = THAI_MONTHS[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
};

/**
 * คำนวณวันที่จาก date preset
 */
export const calculateDateFromPreset = (preset: string): { startDate: Date; endDate: Date } => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (preset) {
        case 'today':
            break;
        case 'yesterday':
            startDate.setDate(today.getDate() - 1);
            endDate.setDate(today.getDate() - 1);
            break;
        case 'this_week':
        case 'thisWeek':
            const day = today.getDay();
            const diff = today.getDate() - day + (day === 0 ? -6 : 1);
            startDate.setDate(diff);
            endDate.setDate(startDate.getDate() + 6);
            break;
        case 'last_week':
        case 'lastWeek':
            const lastWeekToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
            const lastDay = lastWeekToday.getDay();
            const lastDiff = lastWeekToday.getDate() - lastDay + (lastDay === 0 ? -6 : 1);
            startDate = new Date(lastWeekToday.setDate(lastDiff));
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            break;
        case 'this_month':
        case 'thisMonth':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            break;
        case 'last_month':
        case 'lastMonth':
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            endDate = new Date(today.getFullYear(), today.getMonth(), 0);
            break;
        case 'this_year':
        case 'thisYear':
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = new Date(today.getFullYear(), 11, 31);
            break;
        case 'last_year':
        case 'lastYear':
            startDate = new Date(today.getFullYear() - 1, 0, 1);
            endDate = new Date(today.getFullYear() - 1, 11, 31);
            break;
        default:
            break;
    }

    return { startDate, endDate };
};

// ===== Filter Builders =====

/**
 * สร้าง SQL filter สำหรับพนักงาน
 */
export const buildEmployeeFilter = (employeeFilter: EmployeeFilterState): string => {
    switch (employeeFilter.filterType) {
        case 'single':
            return employeeFilter.selectedEmployee
                ? ` and cashier_code = '${employeeFilter.selectedEmployee}'`
                : '';
        case 'range':
            if (employeeFilter.rangeStart && employeeFilter.rangeEnd) {
                return ` and cashier_code between '${employeeFilter.rangeStart}' and '${employeeFilter.rangeEnd}'`;
            }
            return '';
        case 'multiple':
            if (employeeFilter.selectedEmployees.length > 0) {
                const codes = employeeFilter.selectedEmployees.map(code => `'${code}'`).join(',');
                return ` and cashier_code in (${codes})`;
            }
            return '';
        case 'all':
        default:
            return '';
    }
};

/**
 * สร้าง SQL filter สำหรับสาขา
 */
export const buildBranchFilter = (branchFilter: BranchFilterState): string => {
    switch (branchFilter.filterType) {
        case 'single':
            return branchFilter.selectedBranch
                ? ` and pos_id = '${branchFilter.selectedBranch}'`
                : '';
        case 'range':
            if (branchFilter.rangeStart && branchFilter.rangeEnd) {
                return ` and pos_id between '${branchFilter.rangeStart}' and '${branchFilter.rangeEnd}'`;
            }
            return '';
        case 'multiple':
            if (branchFilter.selectedBranches.length > 0) {
                const codes = branchFilter.selectedBranches.map(code => `'${code}'`).join(',');
                return ` and pos_id in (${codes})`;
            }
            return '';
        case 'all':
        default:
            return '';
    }
};

// ===== Main Query Builder =====

export interface BuildQueryParams {
    startDate: Date;
    endDate: Date;
    filters: ReportFilters;
}

/**
 * สร้าง SQL Query จาก template และ parameters
 */
export const buildQuery = (params: BuildQueryParams): string => {
    const { startDate, endDate, filters } = params;

    const formattedStartDate = formatDateForQuery(startDate);
    const formattedEndDate = formatDateForQuery(endDate);

    const employeeFilter = buildEmployeeFilter(filters.employee);
    const branchFilter = buildBranchFilter(filters.branch);

    let query = BASE_QUERY_TEMPLATE
        .replace(/\{\{start_date\}\}/g, formattedStartDate)
        .replace(/\{\{end_date\}\}/g, formattedEndDate)
        .replace('{{employee_filter}}', employeeFilter)
        .replace('{{branch_filter}}', branchFilter);

    return query;
};

/**
 * สร้าง Query Config สำหรับส่ง API
 */
export const buildQueryConfig = (params: BuildQueryParams): QueryConfig => {
    const query = buildQuery(params);

    return {
        shopid: SHOP_ID_PUBLIC,
        limit: 5000,
        query_items: [{
            alias: "daily_sales_summary",
            query: query,
            summary_config: DEFAULT_SUMMARY_CONFIG
        }]
    };
};

/**
 * สร้าง PDF Config สำหรับส่ง API
 */
export const buildPdfConfig = (
    guid: string,
    startDate: Date,
    endDate: Date
): PdfConfig => {
    const thaiStartDate = formatThaiDate(startDate);
    const thaiEndDate = formatThaiDate(endDate);

    return {
        shopid: SHOP_ID_PUBLIC,
        guid,
        pdf_config: {
            title: "รายงานสรุปยอดขายประจำวัน (SRR50003)",
            description: `ตั้งแต่วันที่ ${thaiStartDate} ถึงวันที่ ${thaiEndDate}`,
            title_align: "C",
            description_align: "L",
            orientation: "L",
            page_size: "A4"
        },
        layout_config: {
            schema_version: 1,
            styles: PDF_STYLES,
            sections: [
                {
                    alias: "daily_sales_summary",
                    row_type: "detail",
                    columns: [
                        { field: "doc_date" },
                        { field: "pos_id" },
                        { field: "cashier_name" },
                        { field: "total_cash" },
                        { field: "total_wallet" },
                        { field: "total_card" },
                        { field: "total_amount" },
                        { field: "total_1" },
                        { field: "total_2" },
                        { field: "total_3" },
                        { field: "total_s" }
                    ]
                }
            ],
            column_schema: COLUMN_SCHEMA
        }
    };
};

// ===== Helper for Schedules =====

/**
 * สร้าง Query Config จาก date preset และ filters (สำหรับ Schedule)
 */
export const buildQueryConfigFromPreset = (
    datePreset: string,
    filters: ReportFilters
): QueryConfig => {
    const { startDate, endDate } = calculateDateFromPreset(datePreset);
    return buildQueryConfig({ startDate, endDate, filters });
};

/**
 * สร้าง Serializable Filter Config สำหรับเก็บใน MongoDB
 */
export const serializeFilters = (filters: ReportFilters): ReportFilters => {
    return JSON.parse(JSON.stringify(filters));
};

/**
 * Deserialize Filter Config จาก MongoDB
 */
export const deserializeFilters = (data: any): ReportFilters => {
    return {
        employee: {
            filterType: data?.employee?.filterType || 'all',
            selectedEmployee: data?.employee?.selectedEmployee || '',
            rangeStart: data?.employee?.rangeStart || '',
            rangeEnd: data?.employee?.rangeEnd || '',
            selectedEmployees: data?.employee?.selectedEmployees || []
        },
        branch: {
            filterType: data?.branch?.filterType || 'all',
            selectedBranch: data?.branch?.selectedBranch || '',
            rangeStart: data?.branch?.rangeStart || '',
            rangeEnd: data?.branch?.rangeEnd || '',
            selectedBranches: data?.branch?.selectedBranches || []
        }
    };
};
