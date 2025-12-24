// Config สำหรับ B4029 - รายงานยกเลิกขายสินค้าและบริการ แยกสาขา

import { SHOP_ID_PUBLIC } from '@/lib/constants';
import type {
    QueryConfig,
    PdfConfig,
    DatePreset,
    DayOfWeek,
    ReportFilters,
    CustomerFilterState,
    BranchFilterState
} from './types';

// Report Info
export const REPORT_ID = 'B4029';
export const REPORT_NAME = 'รายงานยกเลิกขายสินค้าและบริการ แยกสาขา';

// Base Query Template - จาก query ที่ user ให้มา
export const BASE_QUERY_TEMPLATE = `select branch_code,(select name_1 from erp_branch_list where code = branch_code) as branch_name,doc_date ,doc_no ,doc_ref_date ,doc_ref ,cust_code ,cust_name
 from (select branch_code,(select name_1 from erp_branch_list where code = branch_code) as branch_name
	   ,cust_code,(select name_1 from ar_customer where ic_trans.cust_code=ar_customer.code) as cust_name
	   ,total_value,total_discount,total_value - total_discount as total_after_discount,total_vat_value,total_except_vat
	   ,doc_date,doc_no,doc_time,cashier_code,doc_ref_date,doc_ref,total_amount,total_before_vat,vat_type,vat_rate,last_status as _def_last_status
	   ,cast(last_status as varchar)||','||cast(used_status as varchar)||','||cast(doc_success as varchar)||','||cast(not_approve_1 as varchar)||','||cast(on_hold as varchar)||','||cast(approve_status as varchar)||','||cast(expire_status  as varchar) as last_status
	   from ic_trans
	   where trans_flag in(45)  and doc_date between '{{start_date}}' and '{{end_date}}'{{customer_filter}}{{branch_filter}}
   and last_status=0) as temp1 order by branch_code,doc_date,doc_no`;

// Default Summary Config
export const DEFAULT_SUMMARY_CONFIG = {
    levels: [{
        group_by_fields: ["branch_code"],
        sum_fields: [],
        typejson: 1
    }],
    grand_total: false,
    grand_total_type: 0
};

// Default Query Config
export const getDefaultQueryConfig = (): QueryConfig => ({
    shopid: SHOP_ID_PUBLIC,
    limit: 5000,
    query_items: [{
        alias: "cancel_sales",
        query: BASE_QUERY_TEMPLATE,
        summary_config: DEFAULT_SUMMARY_CONFIG
    }]
});

// Column Schema
export const COLUMN_SCHEMA = {
    "branch_code": {
        label: "สาขา",
        flex: 10,
        align: "L" as const,
        data_type: "string"
    },
    "branch_name": {
        label: "ชื่อสาขา",
        flex: 90,
        align: "L" as const,
        data_type: "string"
    },
    "doc_date": {
        label: "วันที่",
        flex: 8,
        align: "L" as const,
        data_type: "date",
        format: "dd/MM/yyyy",
        use_buddhist_year: true
    },
    "doc_no": {
        label: "เลขที่เอกสาร",
        flex: 10,
        align: "L" as const,
        data_type: "string"
    },
    "doc_ref_date": {
        label: "วันที่อ้างอิง",
        flex: 8,
        align: "L" as const,
        data_type: "date",
        format: "dd/MM/yyyy",
        use_buddhist_year: true
    },
    "doc_ref": {
        label: "เอกสารอ้างอิง",
        flex: 10,
        align: "L" as const,
        data_type: "string"
    },
    "cust_code": {
        label: "รหัสลูกค้า",
        flex: 8,
        align: "L" as const,
        data_type: "string"
    },
    "cust_name": {
        label: "ชื่อลูกค้า",
        flex: 12,
        align: "L" as const,
        data_type: "string"
    }
};

// Default PDF Config
export const getDefaultPdfConfig = (thaiStartDate: string, thaiEndDate: string): PdfConfig => ({
    shopid: SHOP_ID_PUBLIC,
    pdf_config: {
        title: `${REPORT_NAME} (${REPORT_ID})`,
        description: `ตั้งแต่วันที่ ${thaiStartDate} ถึงวันที่ ${thaiEndDate}`,
        orientation: "L",
        page_size: "A4",
        title_align: "C",
        description_align: "L"
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
                row_spacing: 1.0,
                column_spacing: 2,
                grid_color: "#CCCCCC"
            }
        },
        sections: [{
            alias: "cancel_sales",
            row_type: "detail",
            columns: [
                { field: "branch_code" },
                { field: "branch_name" },
                { field: "doc_date" },
                { field: "doc_no" },
                { field: "doc_ref_date" },
                { field: "doc_ref" },
                { field: "cust_code" },
                { field: "cust_name" }
            ]
        }],
        column_schema: COLUMN_SCHEMA
    }
});

// Date Presets
export const DATE_PRESETS: DatePreset[] = [
    { value: 'today', label: 'วันนี้' },
    { value: 'yesterday', label: 'เมื่อวานนี้' },
    { value: 'this_week', label: 'สัปดาห์นี้' },
    { value: 'last_week', label: 'สัปดาห์ก่อน' },
    { value: 'this_month', label: 'เดือนนี้' },
    { value: 'last_month', label: 'เดือนก่อน' },
    { value: 'this_year', label: 'ปีนี้' },
    { value: 'last_year', label: 'ปีก่อน' },
];

// Days of Week
export const DAYS_OF_WEEK: DayOfWeek[] = [
    { value: 0, label: 'อาทิตย์' },
    { value: 1, label: 'จันทร์' },
    { value: 2, label: 'อังคาร' },
    { value: 3, label: 'พุธ' },
    { value: 4, label: 'พฤหัสบดี' },
    { value: 5, label: 'ศุกร์' },
    { value: 6, label: 'เสาร์' },
];

// Thai Months
export const THAI_MONTHS = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

// Default Filter State
export const getDefaultCustomerFilterState = (): CustomerFilterState => ({
    filterType: 'all',
    selectedCustomer: '',
    rangeStart: '',
    rangeEnd: '',
    selectedCustomers: []
});

export const getDefaultBranchFilterState = (): BranchFilterState => ({
    filterType: 'all',
    selectedBranch: '',
    rangeStart: '',
    rangeEnd: '',
    selectedBranches: []
});

export const getDefaultReportFilters = (): ReportFilters => ({
    customer: getDefaultCustomerFilterState(),
    branch: getDefaultBranchFilterState()
});
