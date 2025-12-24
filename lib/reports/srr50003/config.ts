// Config สำหรับ SRR50003 - รายงานสรุปยอดขายประจำวัน

import type { DatePreset, DayOfWeek, ReportFilters } from './types';
import { SHARED_PDF_STYLES } from '../shared-styles';

// Report Identification
export const REPORT_ID = 'SRR50003';
export const REPORT_NAME = 'รายงานสรุปยอดขายประจำวัน (SRR50003)';

// Base SQL Query Template
export const BASE_QUERY_TEMPLATE = `SELECT
       doc_date,(CASE when (pos_id <> '') THEN 1 ELSE 0 END) as pos_status,(CASE when (pos_id <> '') THEN pos_id ELSE 'ขายหลังร้าน' END) as pos_id,
       cashier_code,(select name_1 from erp_user where code=cashier_code) as cashier_name,
       SUM(Totale1) total_cash,
       sum(Totale9) total_wallet,
       SUM(Totale2) total_card,
       SUM(Totale3) total_amount,
       SUM(Totale4) total_1,
       SUM(Totale5) total_2,
       SUM(Totale6) total_3,
       SUM(Totale7) total_s,
       SUM(Totale8) total_d
FROM
(
       select doc_date,pos_id,cashier_code,(select name_1 from erp_user where code=cashier_code) as cashier_name

       ---เงินสด---
       ,(CASE when (is_pos = 1) THEN (((select cb_trans.total_net_amount from cb_trans where cb_trans.doc_no=ic_trans.doc_no)
         +(CASE WHEN discount_word <> '' THEN discount_word::numeric ELSE 0 END))
         -(select cb_trans.card_amount from cb_trans where cb_trans.doc_no=ic_trans.doc_no)
         -(select cb_trans.wallet_amount from cb_trans where cb_trans.doc_no=ic_trans.doc_no)
         ) ELSE 0 END) AS Totale1 --เงินสด
        ---เงินเชื่อ---
              ,(CASE when (is_pos = 1) THEN (select cb_trans.card_amount from cb_trans where cb_trans.doc_no=ic_trans.doc_no) ELSE 0 END) AS Totale2
        ---wallet---
              ,(CASE when (is_pos = 1) THEN ( (select cb_trans.wallet_amount from cb_trans where cb_trans.doc_no=ic_trans.doc_no)
         +(CASE WHEN discount_word <> '' THEN discount_word::numeric ELSE 0 END)
         ) ELSE 0 END) AS Totale9 --wallet

        ---	Total_amount---
              ,(CASE when (is_pos = 1) THEN (select cb_trans.total_net_amount from cb_trans where cb_trans.doc_no=ic_trans.doc_no)
              +(CASE WHEN discount_word <> '' THEN discount_word::numeric ELSE 0 END) ELSE 0 END) AS Totale3 --Total_amount

              ,(CASE when (is_pos = 0) and (inquiry_type = 1) THEN total_amount ELSE 0 END) AS Totale4
              ,(CASE when (is_pos = 0) and (inquiry_type = 0) THEN total_amount ELSE 0 END) AS Totale5
              ,(CASE when (is_pos = 0) THEN total_amount ELSE 0 END) AS Totale6
              ,(CASE when (is_pos in (0,1)) THEN (total_amount+(CASE when discount_word <> '' THEN discount_word::numeric ELSE 0 END)) ELSE 0 END) AS Totale7,
          (CASE when discount_word <> '' THEN discount_word::numeric ELSE 0 END) as Totale8

       from  ic_trans where trans_flag = 44 and last_status = 0 and doc_date between '{{start_date}}' and '{{end_date}}'{{employee_filter}}{{branch_filter}}   ) t
GROUP BY doc_date,pos_id,cashier_code order by doc_date,pos_id,cashier_code`;

// Default Summary Config
export const DEFAULT_SUMMARY_CONFIG = {
    levels: [
        {
            group_by_fields: ["doc_date"],
            sum_fields: ["total_cash", "total_wallet", "total_card", "total_amount", "total_1", "total_2", "total_3", "total_s", "total_d"],
            typejson: 1
        }
    ],
    grand_total: true,
    grand_total_type: 99
};

// Column Schema for PDF
export const COLUMN_SCHEMA = {
    "doc_date": {
        label: "เอกสารวันที่",
        flex: 10,
        align: "L" as const,
        data_type: "date",
        format: "dd/MM/yyyy",
        use_buddhist_year: true
    },
    "pos_id": {
        label: "ประเภทการขาย",
        flex: 12,
        align: "L" as const,
        hide_when_summary: true
    },
    "cashier_name": {
        label: "พนักงานขาย",
        flex: 15,
        align: "L" as const,
        hide_when_summary: true
    },
    "total_cash": {
        label: "POS ขายเงินสด",
        flex: 12,
        align: "R" as const,
        data_type: "number",
        format: "#,##0.00"
    },
    "total_wallet": {
        label: "POS ขาย Wallet",
        flex: 12,
        align: "R" as const,
        data_type: "number",
        format: "#,##0.00"
    },
    "total_card": {
        label: "POS ขายเงินเชื่อ",
        flex: 12,
        align: "R" as const,
        data_type: "number",
        format: "#,##0.00"
    },
    "total_amount": {
        label: "POS ยอดเงินรวม",
        flex: 12,
        align: "R" as const,
        data_type: "number",
        format: "#,##0.00"
    },
    "total_1": {
        label: "ขายเงินสด",
        flex: 12,
        align: "R" as const,
        data_type: "number",
        format: "#,##0.00"
    },
    "total_2": {
        label: "ขายเงินเชื่อ",
        flex: 12,
        align: "R" as const,
        data_type: "number",
        format: "#,##0.00"
    },
    "total_3": {
        label: "รวมขาย",
        flex: 12,
        align: "R" as const,
        data_type: "number",
        format: "#,##0.00"
    },
    "total_s": {
        label: "ยอดขายสุทธิ",
        flex: 12,
        align: "R" as const,
        data_type: "number",
        format: "#,##0.00"
    }
};

// PDF Styles
export const PDF_STYLES = SHARED_PDF_STYLES;

// Date Presets
export const DATE_PRESETS: DatePreset[] = [
    { value: 'today', label: 'วันนี้' },
    { value: 'yesterday', label: 'เมื่อวาน' },
    { value: 'this_week', label: 'สัปดาห์นี้' },
    { value: 'last_week', label: 'สัปดาห์ที่แล้ว' },
    { value: 'this_month', label: 'เดือนนี้' },
    { value: 'last_month', label: 'เดือนที่แล้ว' },
    { value: 'this_year', label: 'ปีนี้' },
    { value: 'last_year', label: 'ปีที่แล้ว' }
];

// Days of Week
export const DAYS_OF_WEEK: DayOfWeek[] = [
    { value: 0, label: 'อาทิตย์' },
    { value: 1, label: 'จันทร์' },
    { value: 2, label: 'อังคาร' },
    { value: 3, label: 'พุธ' },
    { value: 4, label: 'พฤหัสบดี' },
    { value: 5, label: 'ศุกร์' },
    { value: 6, label: 'เสาร์' }
];

// Thai Months
export const THAI_MONTHS = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
    'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
    'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

// Default PDF Layout Config
export const DEFAULT_PDF_LAYOUT_CONFIG = {
    schema_version: 1,
    styles: PDF_STYLES,
    sections: [{
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
    }],
    column_schema: COLUMN_SCHEMA
};

// Default Filter State Helpers
export const getDefaultEmployeeFilterState = () => ({
    filterType: 'all' as const,
    selectedEmployee: '',
    rangeStart: '',
    rangeEnd: '',
    selectedEmployees: []
});

export const getDefaultBranchFilterState = () => ({
    filterType: 'all' as const,
    selectedBranch: '',
    rangeStart: '',
    rangeEnd: '',
    selectedBranches: []
});

// Default Report Filters
export const getDefaultReportFilters = (): ReportFilters => ({
    employee: getDefaultEmployeeFilterState(),
    branch: getDefaultBranchFilterState()
});
