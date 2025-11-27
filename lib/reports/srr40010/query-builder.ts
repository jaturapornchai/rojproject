// Query Builder สำหรับ SRR40010 - รายงานเปรียบเทียบราคาขาย

import { SHOP_ID_PUBLIC } from '@/lib/constants';
import { 
    BASE_QUERY_TEMPLATE, 
    DEFAULT_SUMMARY_CONFIG,
    getDefaultPdfConfig 
} from './config';
import type { 
    CustomerFilterState, 
    BranchFilterState, 
    DiffFilterType, 
    SaleType,
    ReportFilters,
    QueryConfig,
    PdfConfig
} from './types';

// ===== Date Utilities =====

/**
 * แปลงวันที่เป็น format YYYY-MM-DD
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
 * สร้าง SQL filter สำหรับลูกค้า
 */
export const buildCustomerFilter = (customerFilter: CustomerFilterState): string => {
    switch (customerFilter.filterType) {
        case 'single':
            return customerFilter.selectedCustomer 
                ? ` and cust_code = '${customerFilter.selectedCustomer}'` 
                : '';
        case 'range':
            if (customerFilter.rangeStart && customerFilter.rangeEnd) {
                return ` and cust_code between '${customerFilter.rangeStart}' and '${customerFilter.rangeEnd}'`;
            }
            return '';
        case 'multiple':
            if (customerFilter.selectedCustomers.length > 0) {
                const codes = customerFilter.selectedCustomers.map(code => `'${code}'`).join(',');
                return ` and cust_code in (${codes})`;
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
                ? ` and branch_code = '${branchFilter.selectedBranch}'` 
                : '';
        case 'range':
            if (branchFilter.rangeStart && branchFilter.rangeEnd) {
                return ` and branch_code between '${branchFilter.rangeStart}' and '${branchFilter.rangeEnd}'`;
            }
            return '';
        case 'multiple':
            if (branchFilter.selectedBranches.length > 0) {
                const codes = branchFilter.selectedBranches.map(code => `'${code}'`).join(',');
                return ` and branch_code in (${codes})`;
            }
            return '';
        case 'all':
        default:
            return '';
    }
};

/**
 * สร้าง SQL filter สำหรับประเภทการขาย
 */
export const buildSaleTypeFilter = (saleType: SaleType): string => {
    switch (saleType) {
        case 'backend':
            return ' and is_pos = 0';
        case 'pos':
            return ' and is_pos = 1';
        case 'all':
        default:
            return '';
    }
};

/**
 * สร้าง SQL condition สำหรับ diff filter
 */
export const buildDiffFilterCondition = (diffFilter: DiffFilterType): string => {
    switch (diffFilter) {
        case '0': // แสดงทั้งหมด (!=0)
            return '(price-coalesce(case when price_cust <> 0 then price_cust else price_cust_unit end,0)) <> 0';
        case '1': // เฉพาะค่าบวก (>0)
            return '(price-coalesce(case when price_cust <> 0 then price_cust else price_cust_unit end,0)) > 0';
        case '2': // เฉพาะค่าลบ (<0)
            return '(price-coalesce(case when price_cust <> 0 then price_cust else price_cust_unit end,0)) < 0';
        case '3': // แสดงทุกรายการ
        default:
            return '1=1';
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
    
    const customerFilter = buildCustomerFilter(filters.customer);
    const branchFilter = buildBranchFilter(filters.branch);
    const saleTypeFilter = buildSaleTypeFilter(filters.saleType);
    const diffFilterCondition = buildDiffFilterCondition(filters.diffFilter);

    let query = BASE_QUERY_TEMPLATE
        .replace(/\{\{start_date\}\}/g, formattedStartDate)
        .replace(/\{\{end_date\}\}/g, formattedEndDate)
        .replace('{{customer_filter}}', customerFilter)
        .replace('{{branch_filter}}', branchFilter)
        .replace('{{sale_type_filter}}', saleTypeFilter)
        .replace('{{diff_filter_condition}}', diffFilterCondition);

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
            alias: "price_comparison",
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
    
    const pdfConfig = getDefaultPdfConfig(thaiStartDate, thaiEndDate);
    pdfConfig.guid = guid;
    
    return pdfConfig;
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
        customer: {
            filterType: data?.customer?.filterType || 'all',
            selectedCustomer: data?.customer?.selectedCustomer || '',
            rangeStart: data?.customer?.rangeStart || '',
            rangeEnd: data?.customer?.rangeEnd || '',
            selectedCustomers: data?.customer?.selectedCustomers || []
        },
        branch: {
            filterType: data?.branch?.filterType || 'all',
            selectedBranch: data?.branch?.selectedBranch || '',
            rangeStart: data?.branch?.rangeStart || '',
            rangeEnd: data?.branch?.rangeEnd || '',
            selectedBranches: data?.branch?.selectedBranches || []
        },
        diffFilter: data?.diffFilter || '0',
        saleType: data?.saleType || 'all'
    };
};
