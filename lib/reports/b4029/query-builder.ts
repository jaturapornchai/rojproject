// Query Builder สำหรับ B4029 - รายงานยกเลิกขายสินค้าและบริการ แยกสาขา

import { SHOP_ID_PUBLIC } from '@/lib/constants';
import { BASE_QUERY_TEMPLATE, COLUMN_SCHEMA, REPORT_NAME, THAI_MONTHS } from './config';
import type { ReportFilters, QueryConfig, PdfConfig } from './types';

// Format date for SQL (YYYY-MM-DD)
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
                ? ` and cust_code = '${customer.selectedCustomer}'`
                : '';
        case 'range':
            return customer.rangeStart && customer.rangeEnd
                ? ` and cust_code between '${customer.rangeStart}' and '${customer.rangeEnd}'`
                : '';
        case 'multiple':
            return customer.selectedCustomers.length > 0
                ? ` and cust_code in ('${customer.selectedCustomers.join("','")}')`
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
                ? ` and branch_code = '${branch.selectedBranch}'`
                : '';
        case 'range':
            return branch.rangeStart && branch.rangeEnd
                ? ` and branch_code between '${branch.rangeStart}' and '${branch.rangeEnd}'`
                : '';
        case 'multiple':
            return branch.selectedBranches.length > 0
                ? ` and branch_code in ('${branch.selectedBranches.join("','")}')`
                : '';
        default:
            return '';
    }
};

// Build complete query
export const buildQuery = (
    startDate: Date | null,
    endDate: Date | null,
    filters: ReportFilters
): string => {
    let query = BASE_QUERY_TEMPLATE
        .replace('{{start_date}}', formatDateForQuery(startDate))
        .replace('{{end_date}}', formatDateForQuery(endDate))
        .replace('{{customer_filter}}', buildCustomerFilter(filters))
        .replace('{{branch_filter}}', buildBranchFilter(filters));

    return query;
};

// Build PDF config
export const buildPdfConfig = (
    guid: string,
    startDate: Date | null,
    endDate: Date | null
): PdfConfig => {
    return {
        shopid: SHOP_ID_PUBLIC,
        guid,
        pdf_config: {
            title: REPORT_NAME,
            description: `ตั้งแต่วันที่ ${formatThaiDate(startDate)} ถึงวันที่ ${formatThaiDate(endDate)}`,
            orientation: 'L',
            page_size: 'A4',
            title_align: 'C',
            description_align: 'L'
        },
        layout_config: {
            schema_version: 1,
            styles: {
                use_fill: false,
                header: {
                    background: "#FFFFFF",
                    text: "#000000",
                    border: "#000000",
                    font_weight: "bold"
                },
                detail: {
                    background: "#FFFFFF",
                    text: "#000000",
                    border: "#E0E0E0"
                },
                summary: {
                    background: "#F5F5F5",
                    text: "#000000",
                    border: "#000000",
                    font_weight: "bold"
                },
                level_1: {
                    background: "#F5F5F5",
                    text: "#000000",
                    border: "#000000",
                    font_weight: "bold"
                },
                table: {
                    row_spacing: 0,
                    column_spacing: 2,
                    grid_color: "#CCCCCC"
                }
            },
            sections: [
                {
                    alias: "cancel_sales",
                    row_type: "level_1",
                    columns: [
                        { field: "branch_code" },
                        { field: "branch_name" }
                    ]
                },
                {
                    alias: "cancel_sales",
                    row_type: "detail",
                    columns: [
                        { field: "doc_date" },
                        { field: "doc_no" },
                        { field: "doc_ref_date" },
                        { field: "doc_ref" },
                        { field: "cust_code" },
                        { field: "cust_name" }
                    ]
                }
            ],
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
        case 'this_year': {
            const startOfYear = new Date(today.getFullYear(), 0, 1);
            return { startDate: startOfYear, endDate: new Date(today) };
        }
        case 'last_year': {
            const startOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
            const endOfLastYear = new Date(today.getFullYear() - 1, 11, 31);
            return { startDate: startOfLastYear, endDate: endOfLastYear };
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
        const { getDefaultReportFilters } = require('./config');
        return getDefaultReportFilters();
    }
};
